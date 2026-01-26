const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Token = require('../../../src/models/Token');
const { TokenType } = require('../../../src/config/tokens');
const mongoose = require('mongoose');
const config = require('../../../src/config/config');
const tokenService = require('../../../src/services/tokenService');

beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
}, 60000);

afterAll(async () => {
    await mongoose.connection.close();
});

describe('POST /api/auth/reset-password', () => {
    let testUser;
    let resetToken;

    beforeEach(async () => {
        // Clear database
        await User.deleteMany({});
        await Token.deleteMany({});
        
        // Create test user
        testUser = await User.create({
            userName: 'ResetPasswordTest',
            email: 'resetpassword@example.com',
            password: 'OldPassword123',
            gender: 'male'
        });

        // Generate reset token
        resetToken = await tokenService.generateResetPasswordToken('resetpassword@example.com');
    });

    describe('Successful password reset', () => {
        it('should return 204 and reset password with valid token', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 'NewPassword123'
                })
                .expect(204);

            expect(res.body).toEqual({});

            // Verify password was changed
            const updatedUser = await User.findById(testUser.id);
            const isMatch = await updatedUser.isPasswordMatch('NewPassword123');
            expect(isMatch).toBe(true);
            
            // Verify old password no longer works
            const isOldMatch = await updatedUser.isPasswordMatch('OldPassword123');
            expect(isOldMatch).toBe(false);
        });

        it('should delete all user tokens after password reset', async () => {
            // Create some tokens
            await tokenService.generateAuthTokens(testUser);
            
            let tokens = await Token.find({ userId: testUser.id });
            expect(tokens.length).toBeGreaterThan(1);

            // Reset password
            await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 'NewPassword123'
                })
                .expect(204);

            // Verify all tokens deleted (user logged out from all devices)
            tokens = await Token.find({ userId: testUser.id });
            expect(tokens).toHaveLength(0);
        });

        it('should hash the new password', async () => {
            const newPassword = 'NewPassword123';
            
            await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: newPassword
                })
                .expect(204);

            const updatedUser = await User.findById(testUser.id);
            
            // Password should be hashed (not equal to plain text)
            expect(updatedUser.password).not.toBe(newPassword);
            
            // But should match when compared
            const isMatch = await updatedUser.isPasswordMatch(newPassword);
            expect(isMatch).toBe(true);
        });
    });

    describe('Token validation', () => {
        it('should return 401 if token is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: 'invalid-token',
                    password: 'NewPassword123'
                })
                .expect(401);

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('invalid or expired');

            // Verify password was not changed
            const user = await User.findById(testUser.id);
            const isMatch = await user.isPasswordMatch('OldPassword123');
            expect(isMatch).toBe(true);
        });

        it('should return 401 if token is expired', async () => {
            // Create expired token (mock by creating token with past expiry)
            const jwt = require('jsonwebtoken');
            const config = require('../../../src/config/config');
            const expiredToken = jwt.sign(
                {
                    sub: testUser.id,
                    iat: Math.floor(Date.now() / 1000) - 1200, // 20 minutes ago
                    exp: Math.floor(Date.now() / 1000) - 600,  // 10 minutes ago
                    type: TokenType.RESET_PASSWORD
                },
                config.jwt.secret
            );

            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: expiredToken,
                    password: 'NewPassword123'
                })
                .expect(401);

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('invalid or expired');
        });

        it('should return 401 if token not found in database', async () => {
            const jwt = require('jsonwebtoken');
            const config = require('../../../src/config/config');
            
            // Create valid JWT but not in database
            const tokenNotInDb = jwt.sign(
                {
                    sub: testUser.id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 600,
                    type: TokenType.RESET_PASSWORD
                },
                config.jwt.secret
            );

            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: tokenNotInDb,
                    password: 'NewPassword123'
                })
                .expect(401);

            expect(res.body).toHaveProperty('message');
        });

        it('should return 401 if token is of wrong type', async () => {
            // Generate access token instead of reset token
            const tokens = await tokenService.generateAuthTokens(testUser);
            
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: tokens.access.token,
                    password: 'NewPassword123'
                })
                .expect(401);

            expect(res.body).toHaveProperty('message');
        });

        it('should not allow token reuse', async () => {
            // First reset
            await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 'NewPassword123'
                })
                .expect(204);

            // Try to use same token again
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 'AnotherPassword123'
                })
                .expect(401);

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('invalid or expired');

            // Verify password is still the first reset value
            const user = await User.findById(testUser.id);
            const isMatch = await user.isPasswordMatch('NewPassword123');
            expect(isMatch).toBe(true);
        });
    });

    describe('Password validation', () => {
        it('should return 400 if password is too short', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: '12345' // Only 5 characters
                })
                .expect(400);

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('at least 6 characters');

            // Verify password was not changed
            const user = await User.findById(testUser.id);
            const isMatch = await user.isPasswordMatch('OldPassword123');
            expect(isMatch).toBe(true);
        });

        it('should return 400 if password is too long', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 'a'.repeat(26) // 26 characters
                })
                .expect(400);

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('at most 25 characters');
        });

        it('should accept password with exactly 6 characters', async () => {
            await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 'Pass12'
                })
                .expect(204);

            const user = await User.findById(testUser.id);
            const isMatch = await user.isPasswordMatch('Pass12');
            expect(isMatch).toBe(true);
        });

        it('should accept password with exactly 25 characters', async () => {
            const password = 'A'.repeat(23) + '12'; // 25 chars with letter and number
            
            await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: password
                })
                .expect(204);

            const user = await User.findById(testUser.id);
            const isMatch = await user.isPasswordMatch(password);
            expect(isMatch).toBe(true);
        });
    });

    describe('Request validation', () => {
        it('should return 400 if token is missing', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    password: 'NewPassword123'
                })
                .expect(400);

            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 if password is missing', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken
                })
                .expect(400);

            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 if both token and password are missing', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({})
                .expect(400);

            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 if password is empty string', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: ''
                })
                .expect(400);

            expect(res.body).toHaveProperty('message');
        });

        it('should return 400 if password is not a string', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 12345
                })
                .expect(400);

            expect(res.body).toHaveProperty('message');
        });
    });

    describe('User authentication after reset', () => {
        it('should allow login with new password after reset', async () => {
            // Reset password
            await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 'NewPassword123'
                })
                .expect(204);

            // Try to login with new password
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'resetpassword@example.com',
                    password: 'NewPassword123'
                })
                .expect(200);

            expect(res.body).toHaveProperty('tokens');
            expect(res.body.tokens).toHaveProperty('access');
            expect(res.body.tokens).toHaveProperty('refresh');
        });

        it('should not allow login with old password after reset', async () => {
            // Reset password
            await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    password: 'NewPassword123'
                })
                .expect(204);

            // Try to login with old password
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'resetpassword@example.com',
                    password: 'OldPassword123'
                })
                .expect(401);

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('Incorrect');
        });
    });
});
