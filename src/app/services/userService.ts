import api, { handleApiError } from './api';
import type { Patent } from './patentService';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Innovator' | 'Investor' | 'Manufacturer' | 'Admin';
  country: string;
  avatar: string;
  bio: string;
  company?: string;
  verified: boolean;
  isActive: boolean;
  preferences?: {
    emailNotifications?: boolean;
    marketingEmails?: boolean;
    language?: string;
  };
  profile?: {
    phone?: string;
    website?: string;
    linkedin?: string;
    industries?: string[];
    investmentRange?: string;
    manufacturingCapacity?: string;
    expertise?: string[];
  };
  favoritePatents?: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  country?: string;
  avatar?: string;
  bio?: string;
  company?: string;
  preferences?: {
    emailNotifications?: boolean;
    marketingEmails?: boolean;
    language?: string;
  };
  profile?: {
    phone?: string;
    website?: string;
    linkedin?: string;
    industries?: string[];
    investmentRange?: string;
    manufacturingCapacity?: string;
    expertise?: string[];
  };
}

class UserService {
  async getUsers(role?: string): Promise<User[]> {
    try {
      const params = role ? `?role=${role}` : '';
      const response = await api.get<User[]>(`/users${params}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMe(): Promise<User> {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateMe(data: UpdateUserData): Promise<User> {
    try {
      const response = await api.put<User>('/users/me', data);
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        localStorage.setItem('currentUser', JSON.stringify({ ...user, ...response.data }));
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async searchUsers(searchTerm: string, role?: string): Promise<User[]> {
    try {
      const params = new URLSearchParams({ q: searchTerm });
      if (role) {
        params.append('role', role);
      }
      const response = await api.get<User[]>(`/users/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }


  async getPublicStats(): Promise<{
    total: number;
    innovators: number;
    investors: number;
    manufacturers: number;
    countries: number;
  }> {
    try {
      const response = await api.get('/users/public-stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getStats(): Promise<{
    total: number;
    innovators: number;
    investors: number;
    manufacturers: number;
    verified: number;
    unverified: number;
  }> {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFavoritePatents(): Promise<Patent[]> {
    try {
      const response = await api.get<Patent[]>('/users/me/favorites');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async toggleFavoritePatent(patentId: string): Promise<{ favoritePatentIds: string[]; isFavorite: boolean }> {
    try {
      const response = await api.put<{ favoritePatentIds: string[]; isFavorite: boolean }>(`/users/me/favorites/${patentId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const userService = new UserService();
