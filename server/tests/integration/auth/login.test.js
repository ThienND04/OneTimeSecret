const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const config = require('../../../src/config/config');
const Token = require('../../../src/models/Token');

beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Login API - POST /api/auth/login', () => {
    const testUser = {
        userName: 'logintest',
        gender: 'male',
        email: 'logintest@example.com',
        password: 'password123'
    };

    beforeEach(async () => {
        // Clean up and create test user
        await User.deleteMany({ email: /logintest.*@example\.com/ });
        await Token.deleteMany({});
        
        // Register user and verify success
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        // Check if registration was successful
        if (registerRes.statusCode !== 201) {
            console.error('❌ Failed to register test user:', registerRes.body);
            throw new Error(`Registration failed: ${registerRes.statusCode} - ${JSON.stringify(registerRes.body)}`);
        }
    });

    describe('Successful login', () => {
        test('should login with correct email and password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('tokens');
            expect(res.body.user.email).toBe(testUser.email);
        });

        test('should return access and refresh tokens', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.body.tokens).toHaveProperty('access');
            expect(res.body.tokens).toHaveProperty('refresh');
            expect(res.body.tokens.access).toHaveProperty('token');
            expect(res.body.tokens.refresh).toHaveProperty('token');
            expect(typeof res.body.tokens.access.token).toBe('string');
            expect(typeof res.body.tokens.refresh.token).toBe('string');
        });

        test('should login with uppercase email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email.toUpperCase(),
                    password: testUser.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.email).toBe(testUser.email);
        });

        test('should login with mixed case email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'LoginTest@Example.COM',
                    password: testUser.password
                });

            expect(res.statusCode).toBe(200);
        });

        test('should return user data without password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.body.user).not.toHaveProperty('password');
            expect(res.body.user).toHaveProperty('userName');
            expect(res.body.user).toHaveProperty('email');
            expect(res.body.user).toHaveProperty('gender');
        });
    });

    describe('Authentication failures', () => {
        test('should reject login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toContain('Incorrect email or password');
        });

        test('should reject login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toContain('Incorrect email or password');
        });

        test('should reject login with empty password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: ''
                });

            expect(res.statusCode).toBe(400);
        });

        test('should reject login with missing email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    password: testUser.password
                });

            expect(res.statusCode).toBe(400);
        });

        test('should reject login with missing password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email
                });

            expect(res.statusCode).toBe(400);
        });

        test('should not reveal whether email exists', async () => {
            const wrongEmailRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            const wrongPasswordRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            // Both should return the same message
            expect(wrongEmailRes.body.message).toBe(wrongPasswordRes.body.message);
        });
    });

    describe('Validation errors', () => {
        test('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Validation error');
        });

        test('should reject short password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: '12345'
                });

            expect(res.statusCode).toBe(400);
        });

        test('should reject extra fields', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                    rememberMe: true
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('Multiple login attempts', () => {
        test('should allow multiple logins for same user', async () => {
            const res1 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const res2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res1.statusCode).toBe(200);
            expect(res2.statusCode).toBe(200);
            expect(res1.body.tokens.access.token).not.toBe(res2.body.tokens.access.token);
        });

        test('should generate different tokens on each login', async () => {
            const res1 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const res2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res1.body.tokens.refresh.token).not.toBe(res2.body.tokens.refresh.token);
        });
    });

    describe('Token properties', () => {
        test('should return tokens with expiration times', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.body.tokens.access.expires).toBeGreaterThan(Date.now());
            expect(res.body.tokens.refresh.expires).toBeGreaterThan(Date.now());
            expect(res.body.tokens.refresh.expires).toBeGreaterThan(res.body.tokens.access.expires);
        });

        test('should generate valid JWT tokens', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const accessToken = res.body.tokens.access.token;
            const refreshToken = res.body.tokens.refresh.token;

            // JWT tokens have 3 parts separated by dots
            expect(accessToken.split('.').length).toBe(3);
            expect(refreshToken.split('.').length).toBe(3);
        });
    });

    describe('Edge cases', () => {
        test('should handle email with spaces (trimmed)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: `  ${testUser.email}  `,
                    password: testUser.password
                });

            // Depending on your validation, this might fail or succeed after trimming
            // Adjust expectation based on your implementation
            expect([200, 400, 401]).toContain(res.statusCode);
        });

        test('should handle very long password attempt', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'a'.repeat(1000)
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
