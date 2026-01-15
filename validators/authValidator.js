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
        identifier: z.string().min(1, 'Please provide a username or email'),
        password: z.string().min(6, 'Password must be at least 6 characters long')
    })
};

const logoutSchema = z.strictObject({
    
});

const refreshTokenSchema = z.strictObject({
    
});

module.exports = {
    registerSchema,
    loginSchema
};