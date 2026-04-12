import api, { handleApiError } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AiService {
  /**
   * Chat with AI assistant
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await api.post<{ response: string }>('/ai/chat', { messages });
      return response.data.response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Match patents to investor preferences
   */
  async matchPatents(preferences: any, patents: any[]): Promise<any[]> {
    try {
      const response = await api.post<{ matches: any[] }>('/ai/match-patents', {
        preferences,
        patents,
      });
      return response.data.matches;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Generate patent summary using AI
   */
  async summarizePatent(description: string): Promise<string> {
    try {
      const response = await api.post<{ summary: string }>('/ai/summarize-patent', {
        description,
      });
      return response.data.summary;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get AI recommendations for user
   */
  async getRecommendations(userRole: string, preferences: any): Promise<any> {
    try {
      // Build a prompt based on user role
      let prompt = '';
      
      if (userRole === 'Investor') {
        prompt = `I'm an investor interested in ${preferences.industries?.join(', ') || 'various industries'}. 
                  My investment range is ${preferences.investmentRange || 'flexible'}. 
                  What types of patents should I look for?`;
      } else if (userRole === 'Manufacturer') {
        prompt = `I'm a manufacturer with capacity in ${preferences.manufacturingCapacity || 'various sectors'}. 
                  What types of patents would be good for commercialization?`;
      } else {
        prompt = 'What are the trending patent categories right now?';
      }

      const response = await this.chat([{ role: 'user', content: prompt }]);
      return { recommendations: response };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const aiService = new AiService();
