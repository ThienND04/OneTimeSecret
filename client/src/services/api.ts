import { API_URL } from '../config/constants';

class ApiService {
    private baseURL: string;

    constructor() {
        this.baseURL = `${API_URL}/api`;
    }

    async createSecret(data: {
        content: string;
        password?: string;
        is_client_encrypted?: boolean;
        title?: string;
        files?: File[];
    }) {
        const formData = new FormData();
        formData.append('content', data.content);
        if (data.password) formData.append('password', data.password);
        if (data.is_client_encrypted)
            formData.append('is_client_encrypted', 'true');
        if (data.title) formData.append('title', data.title);

        if (data.files) {
            data.files.forEach((file) => {
                formData.append('files', file);
            });
        }

        const response = await fetch(`${this.baseURL}/secret`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create secret');
        }

        return response.json();
    }

    async getSecret(id: string, password?: string) {
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (password) {
            options.body = JSON.stringify({ password });
        }

        const response = await fetch(`${this.baseURL}/secret/${id}`, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch secret');
        }

        return response.json();
    }
}

export const apiService = new ApiService();
