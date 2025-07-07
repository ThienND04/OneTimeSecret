const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
require('dotenv').config();

beforeAll(async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
});

describe('Secret API', () => {
    let secretId;

    test('should create a new secret', async () => {
        const res = await request(app)
            .post('/api/secret')
            .send({ content: 'This is a test secret' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('accessUrl');

        // Tách id từ URL
        const id = res.body.accessUrl.split('/').pop();
        secretId = id;
    });

    test('should read the secret one time and destroy it', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content', 'This is a test secret');
        expect(res.body).toHaveProperty('is_client_encrypted', false);
    });

    test('should return 410 when reading the secret again', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretId}`);

        expect(res.statusCode).toBe(410);
        expect(res.body.message).toMatch(/already viewed/i);
    });
});

describe('Secret API with password', () => {
    let secretIdWithPassword;

    test('should create a new secret with password', async () => {
        const res = await request(app)
            .post('/api/secret')
            .send({ content: 'This is a secret with password', password: 'testpassword' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('accessUrl');

        const id = res.body.accessUrl.split('/').pop();
        secretIdWithPassword = id;
    });

    test('should return 403 for incorrect password', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretIdWithPassword}`)
            .send({ password: 'wrongpassword' });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/incorrect password/i);
    });

    test('should return 401 for missing password', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretIdWithPassword}`)
            .send();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch('Password is required to access this secret');
    });

    test('should read the secret with correct password', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretIdWithPassword}`)
            .send({ password: 'testpassword' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content', 'This is a secret with password');
    });

    test('should return 410 for already viewed', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretIdWithPassword}`)
            .send({ password: 'testpassword' });

        expect(res.statusCode).toBe(410);
        expect(res.body).toHaveProperty('message', 'Secret already viewed and destroyed');
    });
});
