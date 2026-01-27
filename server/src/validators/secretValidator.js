const { z } = require('zod');

/**
 * Validation schema for creating a new secret
 * @type {Object}
 * @property {import('zod').ZodObject} body - Request body schema
 * @property {string} body.content - Secret content (required, min 1 char)
 * @property {string} [body.password] - Optional password protection
 * @property {Array} [body.files] - Optional array of file objects
 * @property {boolean} [body.is_client_encrypted=false] - Whether content is client-side encrypted
 * @property {string} [body.title] - Optional title for tracking (authenticated users only)
 */
const createSecretSchema = {
    body: z.strictObject({
        content: z.string().min(1, 'Content is required'),
        password: z.string().default(null).optional(),
        files: z.array(z.object({
            url: z.string().url('Invalid URL format'),
            originalName: z.string().min(1, 'Original name is required'),
            mimeType: z.string().min(1, 'MIME type is required'),
            filename: z.string().min(1, 'Filename is required')
        })).optional(),
        is_client_encrypted: z.boolean().default(false),
        title: z.string().max(100, 'Title must be 100 characters or less').optional()
    })
};

/**
 * Validation schema for retrieving a secret
 * @type {Object}
 * @property {import('zod').ZodObject} params - URL parameters schema
 * @property {string} params.id - Secret UUID (required, valid UUID format)
 * @property {import('zod').ZodObject} body - Request body schema
 * @property {string} [body.password] - Optional password for protected secrets
 */
const getSecretSchema = {
    params: z.strictObject({
        id: z.string().uuid('Invalid secret ID format'),
    }),
    body: z.strictObject({
        password: z.string().optional()
    })
};

/**
 * Validation schema for getting user's secrets
 * @type {Object}
 * @property {import('zod').ZodObject} query - Query parameters schema
 */
const getUserSecretsSchema = {
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        status: z.enum(['viewed', 'unviewed', 'revoked', 'all']).optional(),
        sortBy: z.string().regex(/^(createdAt|readAt|title):(asc|desc)$/).optional(),
        search: z.string().optional()
    })
};

/**
 * Validation schema for getting secret details
 * @type {Object}
 * @property {import('zod').ZodObject} params - URL parameters schema
 */
const getSecretDetailsSchema = {
    params: z.strictObject({
        id: z.string().uuid('Invalid secret ID format')
    })
};

/**
 * Validation schema for revoking a secret
 * @type {Object}
 * @property {import('zod').ZodObject} params - URL parameters schema
 */
const revokeSecretSchema = {
    params: z.strictObject({
        id: z.string().uuid('Invalid secret ID format')
    })
};

module.exports = {
    createSecretSchema,
    getSecretSchema,
    getUserSecretsSchema,
    getSecretDetailsSchema,
    revokeSecretSchema
};