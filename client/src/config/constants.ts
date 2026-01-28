export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ROUTES = {
    HOME: '/',
    CREATE_SECRET: '/create',
    VIEW_SECRET: '/secret/:id',
    NOT_FOUND: '*'
} as const;

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB (aligned with backend)
export const MAX_FILES = 3;
export const MAX_SECRET_LENGTH = 10000;
