const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
require('dotenv').config();

beforeAll(async () => {
    console.log('Connecting to MongoDB...');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
});

describe('Rate Limiter Middleware', () => {
    test('should allow requests below the limit', async () => {
        for (let i = 0; i < 15; i++) {
            const res = await request(app).post('/api/secret');
            expect(res.statusCode).not.toBe(429);
        }
    });

    test('should block requests above the limit', async () => {
        for (let i = 0; i < 15; i++) {
            await request(app).get('/api/secret');
        }
        const res = await request(app).get('/api/secret');
        expect(res.statusCode).toBe(429); 
        expect(res.body.message).toMatch(/Too many requests, please try again later./i);
    });
});