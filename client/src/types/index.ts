export interface Secret {
  id: string;
  content: string;
  isEncrypted: boolean;
  files?: Array<{
    url: string;
    publicId: string;
    originalName: string;
  }>;
  createdAt: string;
}

export interface CreateSecretResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
  };
}

export interface GetSecretResponse {
  success: boolean;
  data: Secret;
}
