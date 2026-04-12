import api, { handleApiError } from './api';

export interface SupportTicket {
  _id: string;
  user?: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'normal' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportTicketData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority?: 'normal' | 'high';
}

class SupportService {
  async submitTicket(data: CreateSupportTicketData): Promise<SupportTicket> {
    try {
      const response = await api.post<SupportTicket>('/support/tickets', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyTickets(): Promise<SupportTicket[]> {
    try {
      const response = await api.get<SupportTicket[]>('/support/my-tickets');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const supportService = new SupportService();
