import api, { handleApiError } from './api';
import type { User } from './userService';
import type { Patent } from './patentService';
import type { Investment } from './investmentService';

export interface AdminOverview {
  summary: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    patentsPendingApproval: number;
    approvedPatents: number;
    rejectedPatents: number;
    totalInvestments: number;
    activeInvestments: number;
    pendingInvestments: number;
    investmentVolume: number;
  };
  charts: {
    usersByRole: Array<{ label: string; value: number }>;
    patentsByModeration: Array<{ label: string; value: number }>;
    patentsByCategory: Array<{ label: string; value: number }>;
    investmentsByStatus: Array<{ label: string; value: number; amount: number }>;
  };
  recent: {
    users: User[];
    patents: Patent[];
    investments: Investment[];
  };
}

export interface AdminAnalytics extends AdminOverview {
  growth: {
    users: Array<{ label: string; value: number }>;
    patents: Array<{ label: string; value: number }>;
    investments: Array<{ label: string; value: number; amount: number }>;
  };
}

class AdminService {
  async getOverview(): Promise<AdminOverview> {
    try {
      const response = await api.get<AdminOverview>('/admin/overview');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAnalytics(): Promise<AdminAnalytics> {
    try {
      const response = await api.get<AdminAnalytics>('/admin/analytics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUsers(filters?: { role?: string; search?: string; verified?: string; isActive?: string }): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.verified) params.append('verified', filters.verified);
      if (filters?.isActive) params.append('isActive', filters.isActive);
      const response = await api.get<User[]>(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateUser(id: string, data: { verified?: boolean; isActive?: boolean }): Promise<User> {
    try {
      const response = await api.patch<User>(`/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatents(filters?: { moderationStatus?: string; status?: string; search?: string }): Promise<Patent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.moderationStatus) params.append('moderationStatus', filters.moderationStatus);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get<Patent[]>(`/admin/patents${params.toString() ? `?${params.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updatePatent(
    id: string,
    data: {
      moderationStatus?: 'pending_review' | 'approved' | 'rejected';
      adminNotes?: string;
      isFeatured?: boolean;
      isPublic?: boolean;
      status?: 'Active' | 'Pending' | 'Granted' | 'Expired' | 'Rejected';
    },
  ): Promise<Patent> {
    try {
      const response = await api.patch<Patent>(`/admin/patents/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getInvestments(filters?: { status?: string; search?: string }): Promise<Investment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get<Investment[]>(`/admin/investments${params.toString() ? `?${params.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateInvestment(id: string, data: { status?: string; returns?: number; notes?: string; nextMilestone?: string }): Promise<Investment> {
    try {
      const response = await api.patch<Investment>(`/admin/investments/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const adminService = new AdminService();
