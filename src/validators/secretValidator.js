const { z } = require('zod');

/**
 * Validation schema for creating a new secret
 * @type {Object}
 * @property {import('zod').ZodObject} body - Request body schema
 * @property {string} body.content - Secret content (required, min 1 char)
 * @property {string} [body.password] - Optional password protection
 * @property {Array} [body.files] - Optional array of file objects
 * @property {boolean} [body.is_client_encrypted=false] - Whether content is client-side encrypted
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
        is_client_encrypted: z.boolean().default(false)
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
}


module.exports = {
    createSecretSchema,
    getSecretSchema
};