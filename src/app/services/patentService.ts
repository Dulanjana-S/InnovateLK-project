import api, { handleApiError } from './api';

export interface Patent {
  _id: string;
  title: string;
  patentNumber: string;
  category: string;
  description: string;
  innovator: {
    _id: string;
    name: string;
    email: string;
    country: string;
    avatar: string;
    company?: string;
    role?: string;
    verified?: boolean;
    bio?: string;
    profile?: {
      industries?: string[];
      investmentRange?: string;
      manufacturingCapacity?: string;
      expertise?: string[];
    };
  };
  innovatorName: string;
  innovatorCountry: string;
  filingDate: string;
  status: 'Active' | 'Pending' | 'Granted' | 'Expired' | 'Rejected';
  moderationStatus?: 'pending_review' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedAt?: string | null;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  fundingRequired: string;
  investmentStage: string;
  image?: string;
  tags: string[];
  views: number;
  interested: number;
  interestedUsers: Array<{ _id: string; name: string; role: string }>;
  detailRequests?: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      avatar: string;
      company?: string;
      country?: string;
    };
    note?: string;
    status?: 'pending' | 'approved' | 'declined';
    responseNote?: string;
    createdAt: string;
    respondedAt?: string | null;
  }>;
  technicalDetails?: {
    abstract?: string;
    claims?: string[];
    specifications?: string;
    drawings?: string[];
    priorArt?: string[];
  };
  commercialization?: {
    marketSize?: string;
    targetMarket?: string[];
    competitors?: string[];
    uniqueSellingPoint?: string;
    revenueModel?: string;
    timeline?: string;
  };
  documents?: string[];
  isPublic: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatentData {
  title: string;
  patentNumber: string;
  category: string;
  description: string;
  innovatorName: string;
  innovatorCountry: string;
  filingDate: string | Date;
  status?: string;
  fundingRequired: string;
  investmentStage: string;
  image?: string;
  tags?: string[];
  technicalDetails?: any;
  commercialization?: any;
  documents?: string[];
  isPublic?: boolean;
}

export interface PatentFilters {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface PatentAnalytics {
  summary: {
    totalPatents: number;
    totalViews: number;
    totalInterest: number;
    totalDetailRequests?: number;
    averageViewsPerPatent: number;
  };
  performance: Array<{
    id: string;
    title: string;
    views: number;
    interested: number;
    detailRequests?: number;
    status: string;
    moderationStatus?: string;
    category: string;
    createdAt: string;
  }>;
  categories: Array<{
    name: string;
    value: number;
  }>;
}

class PatentService {
  async getUserPatents(_userId?: string): Promise<Patent[]> {
    return this.getMyPatents();
  }

  async getPatents(filters?: PatentFilters): Promise<Patent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'All Categories') params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.skip) params.append('skip', filters.skip.toString());
      const response = await api.get<Patent[]>(`/patents?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPatentById(id: string): Promise<Patent> {
    try {
      const response = await api.get<Patent>(`/patents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFeaturedPatents(): Promise<Patent[]> {
    try {
      const response = await api.get<Patent[]>('/patents/featured');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getTrendingPatents(): Promise<Patent[]> {
    try {
      const response = await api.get<Patent[]>('/patents/trending');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyPatents(): Promise<Patent[]> {
    try {
      const response = await api.get<Patent[]>('/patents/my-patents');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createPatent(data: CreatePatentData): Promise<Patent> {
    try {
      const response = await api.post<Patent>('/patents', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updatePatent(id: string, data: Partial<CreatePatentData>): Promise<Patent> {
    try {
      const response = await api.put<Patent>(`/patents/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deletePatent(id: string): Promise<void> {
    try {
      await api.delete(`/patents/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async expressInterest(patentId: string): Promise<Patent> {
    try {
      const response = await api.post<Patent>(`/patents/${patentId}/interest`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async removeInterest(patentId: string): Promise<Patent> {
    try {
      const response = await api.delete<Patent>(`/patents/${patentId}/interest`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async requestFullDetails(patentId: string, note?: string): Promise<Patent> {
    try {
      const response = await api.post<Patent>(`/patents/${patentId}/request-details`, { note });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async respondToDetailRequest(
    patentId: string,
    requestUserId: string,
    status: 'approved' | 'declined',
    responseNote?: string,
  ): Promise<Patent> {
    try {
      const response = await api.put<Patent>(`/patents/${patentId}/request-details/${requestUserId}`, {
        status,
        responseNote,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async searchPatents(searchTerm: string, filters?: { category?: string; status?: string }): Promise<Patent[]> {
    try {
      const params = new URLSearchParams({ q: searchTerm });
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      const response = await api.get<Patent[]>(`/patents/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyAnalytics(): Promise<PatentAnalytics> {
    try {
      const response = await api.get<PatentAnalytics>('/patents/analytics/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getStats(): Promise<any> {
    try {
      const response = await api.get('/patents/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const patentService = new PatentService();
