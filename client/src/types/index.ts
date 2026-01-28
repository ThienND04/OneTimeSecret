export interface Secret {
    id: string;
    content: string;
    is_client_encrypted: boolean;
    files?: Array<{
        url: string;
        filename: string;
        originalName: string;
        mimeType: string;
    }>;
    createdAt: string;
    title?: string;
}

export interface CreateSecretRequest {
    content: string;
    password?: string;
    is_client_encrypted?: boolean;
    title?: string;
    files?: File[];
}

export interface CreateSecretResponse {
    message: string;
    id: string;
    accessUrl: string;
}

export interface GetSecretRequest {
    password?: string;
}

export interface GetSecretResponse {
    success: boolean;
    data: Secret;
}

// Auth Types
export interface User {
    id: string;
    userName: string;
    email: string;
    gender: 'male' | 'female' | 'helicopter';
    createdAt: string;
}

export interface AuthTokens {
    access: {
        token: string;
        expires: number;
    };
    refresh: {
        token: string;
        expires: number;
    };
}

export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}

export interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
    gender: 'male' | 'female' | 'helicopter';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface RefreshTokensRequest {
    refreshToken: string;
}

export interface LogoutRequest {
    refreshToken: string;
}
