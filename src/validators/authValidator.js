const z = require('zod');

const registerSchema = {
    body: z.strictObject({
        userName: z.string().min(3, 'Username must be at least 3 characters long'),
        gender: z.enum(['male', 'female', 'helicopter']),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters long')
    })
};

const loginSchema = {
    body: z.strictObject({
        email: z.string().email('Please provide a valid email'),
        password: z.string().min(6, 'Password must be at least 6 characters long')
    })
};

const logoutSchema = z.strictObject({
    body: z.strictObject({
        refreshToken: z.string()
    })
});

const refreshTokenSchema = z.strictObject({
    body: z.strictObject({
        refreshToken: z.string()
    })
});

module.exports = {
    registerSchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema
};