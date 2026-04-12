import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any,
    link?: string,
  ): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      user: userId,
      type,
      title,
      message,
      data,
      link,
    });
    return notification.save();
  }

  async getUserNotifications(
    userId: string,
    limit = 50,
  ): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ user: userId, read: false });
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() },
    );
  }


  async markConversationNotificationsAsRead(userId: string, conversationId: string): Promise<void> {
    await this.notificationModel.updateMany(
      {
        user: userId,
        type: 'message',
        read: false,
        'data.conversationId': conversationId,
      },
      { read: true, readAt: new Date() },
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.notificationModel.findOneAndDelete({ _id: id, user: userId });

    if (!result) {
      throw new NotFoundException('Notification not found');
    }
  }
}
