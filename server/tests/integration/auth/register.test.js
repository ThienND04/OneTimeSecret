const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const config = require('../../../src/config/config');

beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Register API - POST /api/auth/register', () => {
    beforeEach(async () => {
        // Clean up test users before each test
        await User.deleteMany({ email: /test.*@example\.com/ });
    });

    describe('Successful registration', () => {
        test('should register a new user with valid data', async () => {
            const userData = {
                userName: 'testuser123',
                gender: 'male',
                email: 'testuser@example.com',
                password: 'password123'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('tokens');
            expect(res.body.user.email).toBe(userData.email.toLowerCase());
            expect(res.body.user.userName).toBe(userData.userName);
            expect(res.body.user).not.toHaveProperty('password');
        });

        test('should return access and refresh tokens', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'tokentest',
                    gender: 'female',
                    email: 'tokentest@example.com',
                    password: 'secure123'
                });

            expect(res.body.tokens).toHaveProperty('access');
            expect(res.body.tokens).toHaveProperty('refresh');
            expect(res.body.tokens.access).toHaveProperty('token');
            expect(res.body.tokens.refresh).toHaveProperty('token');
            expect(res.body.tokens.access).toHaveProperty('expires');
            expect(res.body.tokens.refresh).toHaveProperty('expires');
        });

        test('should hash password before storing', async () => {
            const plainPassword = 'mypassword123';
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'hashtest',
                    gender: 'helicopter',
                    email: 'hashtest@example.com',
                    password: plainPassword
                });

            expect(res.statusCode).toBe(201);

            const user = await User.findOne({ email: 'hashtest@example.com' });
            expect(user.password).not.toBe(plainPassword);
            expect(user.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
        });

        test('should accept all valid gender values', async () => {
            const genders = ['male', 'female', 'helicopter'];

            for (let i = 0; i < genders.length; i++) {
                const res = await request(app)
                    .post('/api/auth/register')
                    .send({
                        userName: `user_${genders[i]}`,
                        gender: genders[i],
                        email: `test${genders[i]}${i}@example.com`,
                        password: 'password123'
                    });

                console.log(`Registration response for gender ${genders[i]}:`, res.body);

                expect(res.statusCode).toBe(201);
                expect(res.body.user.gender).toBe(genders[i]);
            }
        });

        test('should convert email to lowercase', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'casetest',
                    gender: 'male',
                    email: 'CaseTEST@EXAMPLE.COM',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.user.email).toBe('casetest@example.com');
        });
    });

    describe('Validation errors', () => {
        test('should reject registration with existing email', async () => {
            const userData = {
                userName: 'duplicate1',
                gender: 'male',
                email: 'duplicate@example.com',
                password: 'password123'
            };

            // First registration
            await request(app).post('/api/auth/register').send(userData);

            // Try to register again with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'duplicate2',
                    gender: 'female',
                    email: 'duplicate@example.com',
                    password: 'password456'
                });

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch(/Email already in use/);
        });

        test('should reject short username', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'ab',
                    gender: 'male',
                    email: 'shortname@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch(/Validation error/);
        });

        test('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'testuser',
                    gender: 'male',
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch(/Validation error/);
        });

        test('should reject short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'testuser',
                    gender: 'male',
                    email: 'test@example.com',
                    password: '12345'
                });

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch(/Validation error/);
        });

        test('should reject invalid gender', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'testuser',
                    gender: 'unknown',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch(/Validation error/);
        });

        test('should reject missing required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'testuser'
                    // Missing gender, email, password
                });

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch(/Validation error/);
        });

        test('should reject extra fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'testuser',
                    gender: 'male',
                    email: 'test@example.com',
                    password: 'password123',
                    extraField: 'should not be here'
                });

            expect(res.statusCode).toBe(400);
            expect(res.text).toMatch(/Validation error/);
        });
    });

    describe('Database persistence', () => {
        test('should save user to database', async () => {
            const userData = {
                userName: 'dbtest',
                gender: 'male',
                email: 'dbtest@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);

            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.userName).toBe(userData.userName);
            expect(user.gender).toBe(userData.gender);
        });

        test('should create user with timestamp', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'timestamp',
                    gender: 'female',
                    email: 'timestamp@example.com',
                    password: 'password123'
                });

            const user = await User.findOne({ email: 'timestamp@example.com' });
            expect(user.createdAt).toBeDefined();
            expect(user.createdAt).toBeInstanceOf(Date);
        });
    });
});
