const {z} = require('zod');

const createSecretSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    password: z.string().default(null).optional(),
    is_client_encrypted: z.boolean().default(false)
});

const getSecretSchema = z.object({
    password: z.string().optional()
})


module.exports = {
    createSecretSchema,
    getSecretSchema
};