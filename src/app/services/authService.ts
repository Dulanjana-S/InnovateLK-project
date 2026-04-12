import api, { handleApiError } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'Innovator' | 'Investor' | 'Manufacturer';
  country: string;
  bio?: string;
  company?: string;
  avatar?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    country: string;
    avatar: string;
    bio: string;
    company?: string;
    verified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
  resetUrl?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      await api.post('/auth/verify-token');
      return true;
    } catch (_error) {
      return false;
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export const authService = new AuthService();
