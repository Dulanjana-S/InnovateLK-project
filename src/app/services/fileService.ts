import api, { handleApiError } from './api';

export interface UploadedFileResponse {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

class FileService {
  async uploadFile(file: File): Promise<UploadedFileResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UploadedFileResponse>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
      return {
        ...response.data,
        url: response.data.url.startsWith('http') ? response.data.url : `${base}${response.data.url}`,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await api.delete(`/upload/${filename}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const fileService = new FileService();
