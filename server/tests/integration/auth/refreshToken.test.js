const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const Token = require('../../../src/models/Token');
const jwt = require('jsonwebtoken');
const config = require('../../../src/config/config');

beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Refresh Token API - POST /api/auth/refresh-tokens', () => {
    const testUser = {
        userName: 'refreshtest',
        gender: 'male',
        email: 'refreshtest@example.com',
        password: 'password123'
    };

    let refreshToken;
    let accessToken;

    beforeEach(async () => {
        // Clean up and create test user
        await User.deleteMany({ email: /refreshtest.*@example\.com/ });
        await Token.deleteMany({});

        // Register to get initial tokens
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        refreshToken = registerRes.body.tokens.refresh.token;
        accessToken = registerRes.body.tokens.access.token;
    });

    describe('Successful token refresh', () => {
        test('should refresh tokens with valid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('tokens');
            expect(res.body.tokens).toHaveProperty('access');
            expect(res.body.tokens).toHaveProperty('refresh');
        });

        test('should return new access token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            const newAccessToken = res.body.tokens.access.token;
            
            expect(newAccessToken).toBeDefined();
            expect(typeof newAccessToken).toBe('string');
            expect(newAccessToken).not.toBe(accessToken);
            expect(newAccessToken.split('.').length).toBe(3); // JWT format
        });

        test('should return new refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            const newRefreshToken = res.body.tokens.refresh.token;
            
            expect(newRefreshToken).toBeDefined();
            expect(newRefreshToken).not.toBe(refreshToken);
            expect(newRefreshToken.split('.').length).toBe(3);
        });

        test('should delete old refresh token from database', async () => {
            await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            const oldToken = await Token.findOne({ token: refreshToken });
            expect(oldToken).toBeNull();
        });

        test('should save new refresh token to database', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            const newRefreshToken = res.body.tokens.refresh.token;
            const tokenInDb = await Token.findOne({ token: newRefreshToken });
            
            expect(tokenInDb).not.toBeNull();
            expect(tokenInDb.token).toBe(newRefreshToken);
        });

        test('should return tokens with expiration times', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            expect(res.body.tokens.access).toHaveProperty('expires');
            expect(res.body.tokens.refresh).toHaveProperty('expires');
            expect(res.body.tokens.access.expires).toBeGreaterThan(Date.now());
            expect(res.body.tokens.refresh.expires).toBeGreaterThan(Date.now());
        });

        test('should return refresh token with longer expiry than access token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            const accessExpires = res.body.tokens.access.expires;
            const refreshExpires = res.body.tokens.refresh.expires;
            
            expect(refreshExpires).toBeGreaterThan(accessExpires);
        });
    });

    describe('Token refresh failures', () => {
        test('should reject refresh with invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: 'invalid.token.string' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toContain('authenticate');
        });

        test('should reject refresh with missing token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({});

            expect(res.statusCode).toBe(400);
        });

        test('should reject refresh with empty token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: '' });

            expect(res.statusCode).toBe(401);
        });

        test('should reject refresh with access token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: accessToken });

            expect(res.statusCode).toBe(401);
        });

        test('should reject refresh with already used token', async () => {
            // First refresh (should succeed)
            const res1 = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            expect(res1.statusCode).toBe(200);

            // Try to use same token again (should fail)
            const res2 = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            expect(res2.statusCode).toBe(401);
        });

        test('should reject refresh with expired token', async () => {
            // Create an expired token
            const expiredToken = jwt.sign(
                {
                    sub: 'user123',
                    iat: Math.floor(Date.now() / 1000) - 1000,
                    exp: Math.floor(Date.now() / 1000) - 100,
                    type: 'refresh'
                },
                config.jwt.secret
            );

            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: expiredToken });

            expect(res.statusCode).toBe(401);
        });

        test('should reject refresh for deleted user', async () => {
            // Delete the user
            await User.deleteOne({ email: testUser.email });

            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Token rotation', () => {
        test('should be able to refresh multiple times', async () => {
            let currentRefreshToken = refreshToken;

            for (let i = 0; i < 3; i++) {
                const res = await request(app)
                    .post('/api/auth/refresh-tokens')
                    .send({ refreshToken: currentRefreshToken });

                expect(res.statusCode).toBe(200);
                currentRefreshToken = res.body.tokens.refresh.token;
            }
        });

        test('should generate unique tokens on each refresh', async () => {
            const res1 = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            const newRefreshToken1 = res1.body.tokens.refresh.token;

            const res2 = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: newRefreshToken1 });

            const newRefreshToken2 = res2.body.tokens.refresh.token;

            expect(newRefreshToken1).not.toBe(newRefreshToken2);
            expect(res1.body.tokens.access.token).not.toBe(res2.body.tokens.access.token);
        });
    });

    describe('Validation', () => {
        test('should reject extra fields in request', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({
                    refreshToken,
                    extraField: 'not allowed'
                });

            expect(res.statusCode).toBe(400);
        });

        test('should reject null refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: null });

            expect(res.statusCode).toBe(400);
        });

        test('should reject non-string refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: 12345 });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('Security', () => {
        test('should not leak user information on failed refresh', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: 'invalid.token' });

            expect(res.body).not.toHaveProperty('user');
            expect(res.body.message).toContain('authenticate');
        });

        test('should validate token signature', async () => {
            const fakeToken = jwt.sign(
                {
                    sub: 'user123',
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
                    type: 'refresh'
                },
                'wrong-secret-key'
            );

            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: fakeToken });

            expect(res.statusCode).toBe(401);
        });

        test('should only work with refresh type tokens', async () => {
            // Create a token with wrong type
            const wrongTypeToken = jwt.sign(
                {
                    sub: 'user123',
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 3600,
                    type: 'access'
                },
                config.jwt.secret
            );

            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: wrongTypeToken });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Token payload', () => {
        test('should maintain user identity in new tokens', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            const newAccessToken = res.body.tokens.access.token;
            console.log(newAccessToken);
            const payload = jwt.verify(newAccessToken, config.jwt.secret);

            const user = await User.findOne({ email: testUser.email });
            expect(payload.sub).toBe(user.id);
        });

        test('should include correct token types', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            const accessPayload = jwt.verify(res.body.tokens.access.token, config.jwt.secret);
            const refreshPayload = jwt.verify(res.body.tokens.refresh.token, config.jwt.secret);

            expect(accessPayload.type).toBe('access');
            expect(refreshPayload.type).toBe('refresh');
        });
    });

    describe('Edge cases', () => {
        test('should handle malformed JWT', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: 'not.a.valid.jwt.format' });

            expect(res.statusCode).toBe(401);
        });

        test('should handle very long token string', async () => {
            const longToken = 'a'.repeat(10000);
            
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken: longToken });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Response format', () => {
        test('should return success message', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('Token refreshed successfully');
        });

        test('should return properly structured token object', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-tokens')
                .send({ refreshToken });

            expect(res.body.tokens.access).toEqual({
                token: expect.any(String),
                expires: expect.any(Number)
            });

            expect(res.body.tokens.refresh).toEqual({
                token: expect.any(String),
                expires: expect.any(Number)
            });
        });
    });
});
