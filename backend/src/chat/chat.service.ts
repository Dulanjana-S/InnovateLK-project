import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createConversation(requesterId: string, participants: string[]): Promise<any> {
    const uniqueParticipants = Array.from(
      new Set([requesterId, ...participants].filter(Boolean)),
    );

    if (uniqueParticipants.length < 2) {
      throw new BadRequestException('A conversation must include at least two participants');
    }

    if (uniqueParticipants.some((participantId) => participantId === requesterId) && uniqueParticipants.length === 1) {
      throw new BadRequestException('You cannot create a conversation with yourself');
    }

    const existing = await this.findConversationByParticipants(uniqueParticipants);

    if (existing) {
      return this.enrichConversation(existing, requesterId);
    }

    const conversation = await this.conversationModel.create({ participants: uniqueParticipants });
    const populated = await this.conversationModel
      .findById(conversation._id)
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } })
      .exec();

    return this.enrichConversation(populated, requesterId);
  }

  async getOrCreateDirectConversation(requesterId: string, otherUserId: string): Promise<any> {
    if (!otherUserId) {
      throw new BadRequestException('User is required');
    }

    if (requesterId === otherUserId) {
      throw new BadRequestException('You cannot start a conversation with yourself');
    }

    const targetUser = await this.userModel.findById(otherUserId).select('_id').lean().exec();

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    return this.createConversation(requesterId, [otherUserId]);
  }

  async getConversation(id: string, userId: string): Promise<any> {
    const conversation = await this.conversationModel
      .findById(id)
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } })
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    this.ensureParticipant(conversation, userId);
    return this.enrichConversation(conversation, userId);
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const conversations = await this.conversationModel
      .find({ participants: userId })
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } })
      .sort({ updatedAt: -1 })
      .exec();

    return Promise.all(conversations.map((conversation) => this.enrichConversation(conversation, userId)));
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<MessageDocument> {
    if (!content?.trim()) {
      throw new BadRequestException('Message content is required');
    }

    const conversation = await this.conversationModel.findById(conversationId).exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    this.ensureParticipant(conversation, senderId);

    const message = new this.messageModel({
      conversation: conversationId,
      sender: senderId,
      content: content.trim(),
    });

    await message.save();

    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    const participantIds = conversation.participants.map((participant) => this.getParticipantId(participant));
    await Promise.all(
      participantIds
        .filter((participantId) => participantId !== senderId)
        .map((participantId) =>
          this.notificationsService.create(
            participantId,
            'message',
            'New message',
            'You received a new message in an active conversation.',
            { conversationId, senderId },
            `/messages?userId=${senderId}`,
          ),
        ),
    );

    return message.populate('sender', 'name avatar');
  }

  async getMessages(conversationId: string, userId: string, limit = 50): Promise<MessageDocument[]> {
    await this.getConversation(conversationId, userId);

    return this.messageModel
      .find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markConversationAsRead(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);

    await this.messageModel.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: new Types.ObjectId(userId) },
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      },
    );

    await this.notificationsService.markConversationNotificationsAsRead(userId, conversationId);

    return { message: 'Conversation marked as read' };
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.conversationModel.findById(id).exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    this.ensureParticipant(conversation, userId);

    await this.conversationModel.findByIdAndDelete(id);
    await this.messageModel.deleteMany({ conversation: id });
  }

  async getConversationParticipantIds(conversationId: string): Promise<string[]> {
    const conversation = await this.conversationModel.findById(conversationId).exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation.participants.map((participant) => this.getParticipantId(participant));
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.conversationModel.findById(conversationId).exec();
    return !!conversation?.participants.some((participant) => this.getParticipantId(participant) === userId);
  }

  private async findConversationByParticipants(participantIds: string[]) {
    return this.conversationModel
      .findOne({ participants: { $size: participantIds.length, $all: participantIds } })
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } })
      .exec();
  }

  private getParticipantId(participant: any) {
    if (typeof participant === 'string') {
      return participant;
    }

    if (participant instanceof Types.ObjectId) {
      return participant.toString();
    }

    return participant?._id?.toString?.() || participant?.toString?.();
  }

  private ensureParticipant(conversation: ConversationDocument, userId: string) {
    const isParticipant = conversation.participants.some(
      (participant) => this.getParticipantId(participant) === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('You do not have access to this conversation');
    }
  }

  private async enrichConversation(conversation: any, userId: string) {
    if (!conversation) {
      return null;
    }

    const unreadCount = await this.messageModel.countDocuments({
      conversation: conversation._id,
      sender: { $ne: new Types.ObjectId(userId) },
      read: false,
    });

    const plainConversation = conversation.toObject ? conversation.toObject() : conversation;
    const participants: any[] = await this.hydrateParticipants(plainConversation.participants || []);
    const displayParticipant: any = participants.find((participant) => participant._id !== userId) || participants[0] || null;

    return {
      ...plainConversation,
      participants,
      unreadCount,
      displayParticipant,
      title: displayParticipant?.name || 'Conversation',
    };
  }

  private async hydrateParticipants(participants: any[]) {
    const participantIds = participants
      .map((participant) => this.getParticipantId(participant))
      .filter(Boolean);

    if (participantIds.length === 0) {
      return [];
    }

    const users = await this.userModel
      .find({ _id: { $in: participantIds } })
      .select('name email avatar role company country verified')
      .lean()
      .exec();

    const userMap = new Map(users.map((user: any) => [user._id.toString(), { ...user, _id: user._id.toString() }]));

    return participantIds.map((participantId) => {
      const match = userMap.get(participantId);
      if (match) {
        return match;
      }

      return {
        _id: participantId,
        name: 'Unknown user',
        email: '',
        avatar: '',
        role: 'Member',
      };
    });
  }
}
