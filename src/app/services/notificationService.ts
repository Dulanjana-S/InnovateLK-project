import api, { handleApiError } from './api';
import { emitCountsRefresh } from '../utils/appEvents';

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  readAt?: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

class NotificationService {
  async getNotifications(limit = 50): Promise<Notification[]> {
    try {
      const response = await api.get<Notification[]>(`/notifications?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await api.put<Notification>(`/notifications/${id}/read`);
      emitCountsRefresh();
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notifications/read-all');
      emitCountsRefresh();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete(`/notifications/${id}`);
      emitCountsRefresh();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const notificationService = new NotificationService();
