const z = require('zod');

/**
 * Validation schema for user registration
 * @type {Object}
 * @property {import('zod').ZodObject} body - Request body schema
 * @property {string} body.userName - Username (min 3 characters)
 * @property {string} body.gender - Gender ('male', 'female', 'helicopter')
 * @property {string} body.email - Valid email address
 * @property {string} body.password - Password (min 6 characters)
 */
const registerSchema = {
    body: z.strictObject({
        userName: z.string().min(3, 'Username must be at least 3 characters long'),
        gender: z.enum(['male', 'female', 'helicopter']),
        email: z.string().email('Invalid email address'),
        password: z.string()
            .min(6, 'Password must be at least 6 characters long')
            .max(25, 'Password must be at most 25 characters long')
    })
};

/**
 * Validation schema for user login
 * @type {Object}
 * @property {import('zod').ZodObject} body - Request body schema
 * @property {string} body.email - Valid email address
 * @property {string} body.password - Password (min 6 characters)
 */
const loginSchema = {
    body: z.strictObject({
        email: z.string().email('Please provide a valid email'),
        password: z.string().min(6, 'Password must be at least 6 characters long')
    })
};

/**
 * Validation schema for user logout
 * @type {import('zod').ZodObject}
 * @property {Object} body - Request body
 * @property {string} body.refreshToken - Refresh token to invalidate
 */
const logoutSchema = {
    body: z.strictObject({
        refreshToken: z.string()
    })
};

/**
 * Validation schema for refreshing authentication tokens
 * @type {import('zod').ZodObject}
 * @property {Object} body - Request body
 * @property {string} body.refreshToken - Valid refresh token
 */
const refreshTokenSchema = {
    body: z.strictObject({
        refreshToken: z.string()
    })
};

module.exports = {
    registerSchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema
};