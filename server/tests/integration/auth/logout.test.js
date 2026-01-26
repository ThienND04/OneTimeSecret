const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const Token = require('../../../src/models/Token');
const config = require('../../../src/config/config');

beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Logout API - POST /api/auth/logout', () => {
    const testUser = {
        userName: 'logouttest',
        gender: 'male',
        email: 'logouttest@example.com',
        password: 'password123'
    };

    let refreshToken;

    beforeEach(async () => {
        // Clean up and create test user
        await User.deleteMany({ email: /logouttest.*@example\.com/ });
        await Token.deleteMany({});

        // Register and login to get tokens
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        refreshToken = registerRes.body.tokens.refresh.token;
    });

    describe('Successful logout', () => {
        test('should successfully logout with valid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('Logout successful');
        });

        test('should delete refresh token from database', async () => {
            await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            const token = await Token.findOne({ token: refreshToken });
            expect(token).toBeNull();
        });

        test('should not be able to use same refresh token twice', async () => {
            // First logout
            const res1 = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            expect(res1.statusCode).toBe(200);

            // Try to logout again with same token
            const res2 = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            expect(res2.statusCode).toBe(404);
            expect(res2.body.message).toContain('Not found');
        });

        test('should allow user to login again after logout', async () => {
            // Logout
            await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            // Login again
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(loginRes.statusCode).toBe(200);
            expect(loginRes.body.tokens).toHaveProperty('refresh');
        });
    });

    describe('Logout failures', () => {
        test('should reject logout with invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: 'invalid.token.string' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toContain('Not found');
        });

        test('should reject logout with missing refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({});

            expect(res.statusCode).toBe(400);
        });

        test('should reject logout with empty refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: '' });

            expect(res.statusCode).toBe(404);
        });

        test('should reject logout with non-existent token', async () => {
            const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: fakeToken });

            expect(res.statusCode).toBe(404);
        });

        test('should reject extra fields in request', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({
                    refreshToken,
                    extraField: 'should not be here'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('Token management', () => {

        test('should handle multiple sessions from same user', async () => {
            // Login again to create second session
            const secondLoginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const secondRefreshToken = secondLoginRes.body.tokens.refresh.token;

            // Logout from first session
            await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            // Second session should still be valid
            const secondTokenExists = await Token.findOne({ token: secondRefreshToken });
            expect(secondTokenExists).not.toBeNull();
        });
    });

    describe('Security', () => {
        test('should not leak information about token validity', async () => {
            const invalidRes = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: 'completely.invalid.token' });

            const deletedRes = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken }); // Already deleted

            const alreadyDeletedRes = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            // Both should return the same error
            expect(invalidRes.statusCode).toBe(alreadyDeletedRes.statusCode);
            expect(invalidRes.body.message).toBe(alreadyDeletedRes.body.message);
        });

        test('should not accept access token for logout', async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const accessToken = loginRes.body.tokens.access.token;

            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: accessToken });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('Edge cases', () => {
        test('should handle logout with whitespace in token', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: `  ${refreshToken}  ` });

            // Depending on validation, might fail or succeed after trim
            expect([200, 404]).toContain(res.statusCode);
        });

        test('should handle very long invalid token', async () => {
            const longToken = 'a'.repeat(10000);
            
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: longToken });

            expect(res.statusCode).toBe(404);
        });

        test('should handle null refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: null });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('Database state', () => {
        test('should maintain user account after logout', async () => {
            await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            const user = await User.findOne({ email: testUser.email });
            expect(user).not.toBeNull();
            expect(user.email).toBe(testUser.email);
        });

        test('should not affect other user data', async () => {
            const initialUser = await User.findOne({ email: testUser.email });

            await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            const afterLogoutUser = await User.findOne({ email: testUser.email });
            
            expect(afterLogoutUser.userName).toBe(initialUser.userName);
            expect(afterLogoutUser.email).toBe(initialUser.email);
            expect(afterLogoutUser.password).toBe(initialUser.password);
        });
    });

    describe('Response format', () => {
        test('should return success message on successful logout', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            expect(res.body).toHaveProperty('message');
            expect(typeof res.body.message).toBe('string');
        });

        test('should return error message on failed logout', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: 'invalid' });

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toBeTruthy();
        });
    });
});
