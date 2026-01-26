import { API_URL } from '../config/constants';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_URL}/api`;
  }

  async createSecret(data: {
    content: string;
    password?: string;
    isEncrypted?: boolean;
    files?: File[];
  }) {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.password) formData.append('password', data.password);
    if (data.isEncrypted) formData.append('isEncrypted', 'true');
    
    if (data.files) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await fetch(`${this.baseURL}/secret`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create secret');
    }

    return response.json();
  }

  async getSecret(id: string, password?: string) {
    const url = new URL(`${this.baseURL}/secret/${id}`);
    if (password) url.searchParams.append('password', password);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Failed to fetch secret');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
