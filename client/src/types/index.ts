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
    accessUrl: string;
}

export interface GetSecretRequest {
    password?: string;
}

export interface GetSecretResponse {
    success: boolean;
    data: Secret;
}
