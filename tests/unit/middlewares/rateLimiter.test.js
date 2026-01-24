const request = require('supertest');
const config = require('../../../src/config/config');

let app;
let originalEnv;
let originalRateLimit;

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    originalEnv = config.env;
    originalRateLimit = { ...config.rateLimit };
    
    // Override config to test: production environment but lower rate limit
    config.env = 'production'; 
    config.rateLimit.windowMs = 1000; // 1 second
    config.rateLimit.max = 5; // 5 requests per second
    
    // Import app AFTER setting config (so rate limiter is initialized with new config)
    // Clear cache to require again
    delete require.cache[require.resolve('../../../src/middlewares/rateLimiter')];
    delete require.cache[require.resolve('../../../src/app')];
    
    app = require('../../../src/app');
});

afterAll(() => {
    // Restore original config
    config.env = originalEnv;
    config.rateLimit = originalRateLimit;
    
    // Clear cache để lần import sau dùng config gốc
    delete require.cache[require.resolve('../../../src/middlewares/rateLimiter')];
    delete require.cache[require.resolve('../../../src/app')];
});

describe('Rate Limiter Middleware', () => {
    test('should allow requests below the limit', async () => {
        // wait for rate limit window reset
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        // Test with 4 requests (below limit 5)
        for (let i = 0; i < 4; i++) {
            const res = await request(app).get('/api/secret/test-id-' + i);
            // Can return 400, 401, 404 but NOT 429
            expect(res.statusCode).not.toBe(429);
        }
    });

    test('should block requests above the limit', async () => {
        // wait for rate limit window reset
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        // Send 5 requests (reach limit)
        for (let i = 0; i < 5; i++) {
            await request(app).get('/api/secret/over-limit-' + i);
        }
        
        // The 6th request should be blocked with 429
        const res = await request(app).get('/api/secret/should-be-blocked');
        expect(res.statusCode).toBe(429);
        expect(res.body.message).toMatch(/Too many requests/i);
    }, 10000);
});