import { API_URL } from '../config/constants';
import type {
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokensRequest,
    LogoutRequest,
    AuthResponse
} from '../types';

class ApiService {
    private baseURL: string;
    private getAuthToken: (() => string | null) | null = null;

    constructor() {
        this.baseURL = `${API_URL}/api`;
    }

    // Set the function to retrieve auth token
    setAuthTokenGetter(getter: () => string | null) {
        this.getAuthToken = getter;
    }

    // Helper to get headers with auth token if available
    private getHeaders(includeContentType = true): HeadersInit {
        const headers: HeadersInit = {};

        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }

        // Add Authorization header if token is available
        if (this.getAuthToken) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
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

        // Build headers for FormData (no Content-Type, but include auth token if available)
        const headers: HeadersInit = {};
        if (this.getAuthToken) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(`${this.baseURL}/secret`, {
            method: 'POST',
            headers: headers,
            credentials: 'include', // Send cookies with request
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
            headers: this.getHeaders(),
            credentials: 'include' // Send cookies with request
        };

        if (password) {
            options.body = JSON.stringify({ password });
        }

        const response = await fetch(
            `${this.baseURL}/secret/search/${id}`,
            options
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch secret');
        }

        return response.json();
    }

    // Auth Methods
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await fetch(`${this.baseURL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include', // Send cookies with request
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Registration failed');
        }

        return response.json();
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include', // Send cookies with request
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Login failed');
        }

        return response.json();
    }

    async logout(): Promise<void> {
        const response = await fetch(`${this.baseURL}/auth/logout`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include' // Send cookies with request
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Logout failed');
        }
    }

    async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
        const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include', // Send cookies with request
            body: JSON.stringify(data)
        });

        // Backend returns 204 No Content on success
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to send reset email');
        }
    }

    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        const response = await fetch(`${this.baseURL}/auth/reset-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include', // Send cookies with request
            body: JSON.stringify(data)
        });

        // Backend returns 204 No Content on success
        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to reset password');
        }
    }

    async refreshTokens(): Promise<AuthResponse> {
        const response = await fetch(`${this.baseURL}/auth/refresh-tokens`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include' // Send cookies with request
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to refresh tokens');
        }

        return response.json();
    }
}

export const apiService = new ApiService();
