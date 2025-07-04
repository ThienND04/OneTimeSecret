const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
require('dotenv').config();

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Secret API', () => {
    let secretId;

    it('should create a new secret', async () => {
        const res = await request(app)
            .post('/api/secret')
            .send({ content: 'This is a test secret' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('accessUrl');

        // Tách id từ URL
        const id = res.body.accessUrl.split('/').pop();
        secretId = id;
    });

    it('should read the secret one time and destroy it', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content', 'This is a test secret');
    });

    it('should return 410 when reading the secret again', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretId}`);

        expect(res.statusCode).toBe(410);
        expect(res.body.message).toMatch(/already viewed/i);
    });
});
