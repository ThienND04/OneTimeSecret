const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Token = require('../../../src/models/Token');
const { TokenType } = require('../../../src/config/tokens');
const mongoose = require('mongoose');
const config = require('../../../src/config/config');
const emailService = require('../../../src/services/emailService');

jest.mock('../../../src/services/emailService');

beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
}, 60000);

afterAll(async () => {
    await mongoose.connection.close();
});

describe('POST /api/auth/forgot-password', () => {
    let testUser;

    beforeEach(async () => {
        // Clear database
        await User.deleteMany({});
        await Token.deleteMany({});
        
        // Clear email service mocks
        jest.clearAllMocks();
        
        // Create test user
        testUser = await User.create({
            userName: 'ForgotPasswordTest',
            email: 'forgotpassword@example.com',
            password: 'Password123',
            gender: 'male'
        });
    });

    describe('Successful forgot password requests', () => {
        it('should return 204 and send reset email for existing user', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'forgotpassword@example.com' })
                .expect(204);

            expect(res.body).toEqual({});
            
            // Verify email was sent
            expect(emailService.sendResetPasswordEmail).toHaveBeenCalledTimes(1);
            expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith(
                'forgotpassword@example.com',
                expect.any(String)
            );
            
            // Verify token was created in database
            const tokens = await Token.find({ userId: testUser.id, type: TokenType.RESET_PASSWORD });
            expect(tokens).toHaveLength(1);
        });

        it('should return 204 even if email does not exist (prevent enumeration)', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' })
                .expect(204);

            expect(res.body).toEqual({});
            
            // Verify email was NOT sent
            expect(emailService.sendResetPasswordEmail).not.toHaveBeenCalled();
            
            // Verify no token was created
            const tokens = await Token.find({ type: TokenType.RESET_PASSWORD });
            expect(tokens).toHaveLength(0);
        });

        it('should be case-insensitive for email lookup', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'ForgotPassword@Example.COM' })
                .expect(204);

            expect(emailService.sendResetPasswordEmail).toHaveBeenCalledTimes(1);
            
            // Verify token was created
            const tokens = await Token.find({ userId: testUser.id, type: TokenType.RESET_PASSWORD });
            expect(tokens).toHaveLength(1);
        });

        it('should delete old reset tokens before creating new one', async () => {
            // Create first reset token
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'forgotpassword@example.com' })
                .expect(204);

            let tokens = await Token.find({ userId: testUser.id, type: TokenType.RESET_PASSWORD });
            expect(tokens).toHaveLength(1);
            const firstTokenId = tokens[0]._id;

            // Create second reset token
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'forgotpassword@example.com' })
                .expect(204);

            tokens = await Token.find({ userId: testUser.id, type: TokenType.RESET_PASSWORD });
            expect(tokens).toHaveLength(1);
            expect(tokens[0]._id.toString()).not.toBe(firstTokenId.toString());
        });
    });

    describe('Validation errors', () => {
        it('should return 400 if email is missing', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({})
                .expect(400);

            expect(res.body).toHaveProperty('message');
            expect(emailService.sendResetPasswordEmail).not.toHaveBeenCalled();
        });

        it('should return 400 if email is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('valid email');
            expect(emailService.sendResetPasswordEmail).not.toHaveBeenCalled();
        });

        it('should return 400 if email is empty string', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: '' })
                .expect(400);

            expect(res.body).toHaveProperty('message');
            expect(emailService.sendResetPasswordEmail).not.toHaveBeenCalled();
        });

        it('should return 400 if email is not a string', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 12345 })
                .expect(400);

            expect(res.body).toHaveProperty('message');
            expect(emailService.sendResetPasswordEmail).not.toHaveBeenCalled();
        });
    });

    describe('Security considerations', () => {
        it('should not reveal whether email exists through response time', async () => {
            const start1 = Date.now();
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'forgotpassword@example.com' })
                .expect(204);
            const time1 = Date.now() - start1;

            const start2 = Date.now();
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' })
                .expect(204);
            const time2 = Date.now() - start2;

            // Response times should be relatively close (within 200ms)
            expect(Math.abs(time1 - time2)).toBeLessThan(200);
        });

        it('should not return different error messages for existing vs non-existing emails', async () => {
            const res1 = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'forgotpassword@example.com' })
                .expect(204);

            const res2 = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' })
                .expect(204);

            expect(res1.body).toEqual(res2.body);
            expect(res1.status).toBe(res2.status);
        });
    });

    describe('Token generation', () => {
        it('should generate a valid JWT token', async () => {
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'forgotpassword@example.com' })
                .expect(204);

            const token = await Token.findOne({ userId: testUser.id, type: TokenType.RESET_PASSWORD });
            expect(token).toBeDefined();
            expect(token.token).toBeTruthy();
            
            const jwt = require('jsonwebtoken');
            const config = require('../../../src/config/config');
            const decoded = jwt.verify(token.token, config.jwt.secret);
            
            expect(decoded.sub).toBe(testUser.id);
            expect(decoded.type).toBe(TokenType.RESET_PASSWORD);
            expect(decoded.exp - decoded.iat).toBe(600); // 10 minutes
        });

        it('should pass token to email service', async () => {
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'forgotpassword@example.com' })
                .expect(204);

            const callArgs = emailService.sendResetPasswordEmail.mock.calls[0];
            const sentToken = callArgs[1];
            
            const token = await Token.findOne({ userId: testUser.id, type: TokenType.RESET_PASSWORD });
            expect(sentToken).toBe(token.token);
        });
    });
});
