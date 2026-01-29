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
    read?: boolean;
    isRevoked?: boolean;
    userId?: string;
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

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface RefreshTokensRequest {
    refreshToken: string;
}

export interface LogoutRequest {
    refreshToken: string;
}

// User Secrets Management Types
export interface UserSecret {
    id: string;
    title?: string;
    read: boolean;
    isRevoked: boolean;
    createdAt: string;
    expiresAt?: string;
    hasPassword: boolean;
    filesCount: number;
}

export interface GetUserSecretsResponse {
    secrets: UserSecret[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface UserSecretStats {
    total: number;
    viewed: number;
    unviewed: number;
    revoked: number;
}

export interface SecretDetails extends Secret {
    viewHistory: Array<{
        viewedAt: string;
        ipAddress?: string;
    }>;
}
