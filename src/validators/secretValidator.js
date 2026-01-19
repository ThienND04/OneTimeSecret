const {z} = require('zod');

const createSecretSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    password: z.string().default(null).optional(),
    files: z.array(z.object({
        url: z.string().url('Invalid URL format'),
        originalName: z.string().min(1, 'Original name is required'),
        mimeType: z.string().min(1, 'MIME type is required'),
        filename: z.string().min(1, 'Filename is required')
    })).optional(),
    is_client_encrypted: z.boolean().default(false)
});

const getSecretSchema = z.object({
    password: z.string().optional()
})


module.exports = {
    createSecretSchema,
    getSecretSchema
};