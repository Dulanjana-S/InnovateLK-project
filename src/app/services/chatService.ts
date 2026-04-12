import api, { handleApiError } from './api';
import { io, Socket } from 'socket.io-client';
import { emitCountsRefresh } from '../utils/appEvents';

export interface ChatParticipant {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  company?: string;
  country?: string;
  verified?: boolean;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'file';
  read: boolean;
  readAt?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: ChatParticipant[];
  displayParticipant?: ChatParticipant | null;
  title?: string;
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class ChatService {
  private socket: Socket | null = null;
  private messageHandlers: Array<(message: Message) => void> = [];
  private typingHandlers: Array<(data: { conversationId: string; userId: string; isTyping: boolean }) => void> = [];

  initializeSocket(): void {
    if (this.socket?.connected) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const token = localStorage.getItem('accessToken');

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    this.socket.on('newMessage', (message: Message) => {
      emitCountsRefresh();
      this.messageHandlers.forEach((handler) => handler(message));
    });

    this.socket.on('conversationRead', () => {
      emitCountsRefresh();
    });

    this.socket.on('userTyping', (data) => {
      this.typingHandlers.forEach((handler) => handler(data));
    });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNewMessage(handler: (message: Message) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onTyping(handler: (data: { conversationId: string; userId: string; isTyping: boolean }) => void): () => void {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter((h) => h !== handler);
    };
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit('joinConversation', { conversationId });
  }

  sendMessageSocket(conversationId: string, content: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket is not connected'));
        return;
      }

      const timeout = window.setTimeout(() => {
        reject(new Error('Socket acknowledgement timed out'));
      }, 5000);

      this.socket.emit('sendMessage', { conversationId, content }, (response: Message | { message?: string }) => {
        window.clearTimeout(timeout);
        if ((response as any)?.message && !(response as any)?._id) {
          reject(new Error((response as any).message));
          return;
        }
        emitCountsRefresh();
        resolve(response as Message);
      });
    });
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    this.socket?.emit('typing', { conversationId, isTyping });
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get<Conversation[]>('/chat/conversations');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getConversation(id: string): Promise<Conversation> {
    try {
      const response = await api.get<Conversation>(`/chat/conversations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createConversation(participants: string[]): Promise<Conversation> {
    try {
      const response = await api.post<Conversation>('/chat/conversations', { participants });
      emitCountsRefresh();
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getOrCreateDirectConversation(userId: string): Promise<Conversation> {
    try {
      const response = await api.post<Conversation>(`/chat/direct/${userId}`);
      emitCountsRefresh();
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    try {
      const response = await api.get<Message[]>(`/chat/messages/${conversationId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`);
      this.socket?.emit('markConversationRead', { conversationId });
      emitCountsRefresh();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    try {
      const response = await api.post<Message>('/chat/messages', { conversationId, content });
      emitCountsRefresh();
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await api.delete(`/chat/conversations/${id}`);
      emitCountsRefresh();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const chatService = new ChatService();
