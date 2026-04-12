import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new UnauthorizedException('Missing socket token');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.userId = payload.sub;
      await client.join(this.getUserRoom(payload.sub));
    } catch (_error) {
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.ensureConversationParticipant(data.conversationId, client.data.userId);
    await client.join(this.getConversationRoom(data.conversationId));
    return { joined: true };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    await this.ensureConversationParticipant(data.conversationId, senderId);

    const message = await this.chatService.createMessage(
      data.conversationId,
      senderId,
      data.content,
    );

    const participantIds = await this.chatService.getConversationParticipantIds(data.conversationId);
    this.server.to(this.getConversationRoom(data.conversationId)).emit('newMessage', message);
    participantIds.forEach((participantId) => {
      this.server.to(this.getUserRoom(participantId)).emit('newMessage', message);
    });
    return message;
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    await this.ensureConversationParticipant(data.conversationId, client.data.userId);
    client.to(this.getConversationRoom(data.conversationId)).emit('userTyping', {
      conversationId: data.conversationId,
      userId: client.data.userId,
      isTyping: data.isTyping,
    });
    return { ok: true };
  }

  @SubscribeMessage('markConversationRead')
  async handleMarkConversationRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.markConversationAsRead(data.conversationId, client.data.userId);
    this.server.to(this.getConversationRoom(data.conversationId)).emit('conversationRead', {
      conversationId: data.conversationId,
      userId: client.data.userId,
    });
    return { ok: true };
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken.replace(/^Bearer\s+/i, '');
    }

    const headerToken = client.handshake.headers.authorization;
    if (typeof headerToken === 'string' && headerToken.length > 0) {
      return headerToken.replace(/^Bearer\s+/i, '');
    }

    return null;
  }

  private async ensureConversationParticipant(conversationId: string, userId: string) {
    const isParticipant = await this.chatService.isParticipant(conversationId, userId);

    if (!isParticipant) {
      throw new ForbiddenException('You do not have access to this conversation');
    }
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }

  private getConversationRoom(conversationId: string) {
    return `conversation:${conversationId}`;
  }
}
