import api, { handleApiError } from './api';

export interface Investment {
  _id: string;
  patent: {
    _id: string;
    title: string;
    category: string;
    fundingRequired: string;
    investmentStage: string;
    image?: string;
    moderationStatus?: string;
    isPublic?: boolean;
  };
  investor: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    company?: string;
    country?: string;
    role?: 'Investor' | 'Manufacturer';
  };
  innovator: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    company?: string;
    country?: string;
    role?: 'Innovator';
  };
  partnerRole?: 'Investor' | 'Manufacturer';
  amount: number;
  equity: number;
  returns: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  nextMilestone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentData {
  patentId: string;
  amount: number;
  equity?: number;
  nextMilestone?: string;
  notes?: string;
}

export interface UpdateInvestmentData {
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  amount?: number;
  returns?: number;
  equity?: number;
  nextMilestone?: string;
  notes?: string;
}

class InvestmentService {
  async getInvestments(): Promise<Investment[]> {
    try {
      const response = await api.get<Investment[]>('/investments');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getInvestmentById(id: string): Promise<Investment> {
    try {
      const response = await api.get<Investment>(`/investments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createInvestment(data: CreateInvestmentData): Promise<Investment> {
    try {
      const response = await api.post<Investment>('/investments', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateInvestment(id: string, data: UpdateInvestmentData): Promise<Investment> {
    try {
      const response = await api.put<Investment>(`/investments/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const investmentService = new InvestmentService();
