const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const Secret = require('../../../src/models/Secret');
const Token = require('../../../src/models/Token');
const config = require('../../../src/config/config');

beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Secret Management API (Authenticated Users)', () => {
    let accessToken;
    let userId;
    let testUser;

    beforeEach(async () => {
        // Clean up
        await User.deleteMany({ email: /secretmgmt.*@example\.com/ });
        await User.deleteMany({ email: /other.*@example\.com/ });
        await User.deleteMany({ email: /revoke.*@example\.com/ });
        await Secret.deleteMany({});
        await Token.deleteMany({});

        // Create and login test user
        testUser = {
            userName: 'secretmgmtuser',
            gender: 'male',
            email: 'secretmgmt@example.com',
            password: 'password123'
        };

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(registerRes.statusCode).toBe(201);
        accessToken = registerRes.body.tokens.access.token;
        userId = registerRes.body.user.id;
    });

    describe('POST /api/secret - Create secret with authentication', () => {
        test('should associate secret with authenticated user when token provided', async () => {
            const res = await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ 
                    content: 'My authenticated secret',
                    title: 'Test Secret'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('accessUrl');

            // Verify secret is associated with user
            const secretId = res.body.accessUrl.split('/').pop();
            const secret = await Secret.findOne({ id: secretId });
            expect(secret.userId.toString()).toBe(userId);
            expect(secret.title).toBe('Test Secret');
        });

        test('should create anonymous secret when no token provided', async () => {
            const res = await request(app)
                .post('/api/secret')
                .send({ content: 'Anonymous secret' });

            expect(res.statusCode).toBe(201);

            // Verify secret is anonymous
            const secretId = res.body.accessUrl.split('/').pop();
            const secret = await Secret.findOne({ id: secretId });
            expect(secret.userId).toBeNull();
        });

        test('should accept title only for authenticated users', async () => {
            const res = await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ 
                    content: 'Secret with title',
                    title: 'Important Document'
                });

            expect(res.statusCode).toBe(201);
            
            const secretId = res.body.accessUrl.split('/').pop();
            const secret = await Secret.findOne({ id: secretId });
            expect(secret.title).toBe('Important Document');
        });
    });

    describe('GET /api/secret/me/secrets - Get user secrets', () => {
        beforeEach(async () => {
            // Create multiple secrets for the user
            await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Secret 1', title: 'First' });

            await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Secret 2', title: 'Second' });

            await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Secret 3', title: 'Third' });

            // Create anonymous secret (should not appear in user's list)
            await request(app)
                .post('/api/secret')
                .send({ content: 'Anonymous secret' });
        });

        test('should return all user secrets', async () => {
            const res = await request(app)
                .get('/api/secret/me/secrets')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(3);
            expect(res.body.pagination).toMatchObject({
                page: 1,
                total: 3
            });
        });

        test('should require authentication', async () => {
            const res = await request(app)
                .get('/api/secret/me/secrets');

            expect(res.statusCode).toBe(401);
        });

        test('should filter by status - unviewed', async () => {
            const res = await request(app)
                .get('/api/secret/me/secrets?status=unviewed')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(3);
            expect(res.body.data.every(s => s.read === false)).toBe(true);
        });

        test('should support pagination', async () => {
            const res = await request(app)
                .get('/api/secret/me/secrets?page=1&limit=2')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.pagination).toMatchObject({
                page: 1,
                limit: 2,
                total: 3,
                totalPages: 2
            });
        });

        test('should search by title', async () => {
            const res = await request(app)
                .get('/api/secret/me/secrets?search=First')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].title).toBe('First');
        });

        test('should not return encrypted content', async () => {
            const res = await request(app)
                .get('/api/secret/me/secrets')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data[0]).not.toHaveProperty('encrypted_content');
            expect(res.body.data[0]).not.toHaveProperty('password_hash');
            expect(res.body.data[0]).not.toHaveProperty('iv');
        });
    });

    describe('GET /api/secret/me/stats - Get user statistics', () => {
        beforeEach(async () => {
            // Create secrets with different statuses
            const secret1Res = await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Secret 1' });

            const secret2Res = await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Secret 2' });

            // View one secret
            const secretId1 = secret1Res.body.accessUrl.split('/').pop();
            await request(app)
                .get(`/api/secret/${secretId1}`);

            // Revoke another secret
            const secretId2 = secret2Res.body.accessUrl.split('/').pop();
            await request(app)
                .delete(`/api/secret/me/secrets/${secretId2}`)
                .set('Authorization', `Bearer ${accessToken}`);

            // Create one more unviewed
            await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Secret 3' });
        });

        test('should return correct statistics', async () => {
            const res = await request(app)
                .get('/api/secret/me/stats')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                total: 3,
                viewed: 1,
                unviewed: 1,
                revoked: 1
            });
        });

        test('should require authentication', async () => {
            const res = await request(app)
                .get('/api/secret/me/stats');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/secret/me/secrets/:id - Get secret details', () => {
        let secretId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ 
                    content: 'Detailed secret',
                    title: 'My Secret'
                });

            secretId = res.body.accessUrl.split('/').pop();
        });

        test('should return secret details for owner', async () => {
            const res = await request(app)
                .get(`/api/secret/me/secrets/${secretId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(secretId);
            expect(res.body.data.title).toBe('My Secret');
            expect(res.body.data.read).toBe(false);
        });

        test('should not return encrypted content', async () => {
            const res = await request(app)
                .get(`/api/secret/me/secrets/${secretId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).not.toHaveProperty('encrypted_content');
        });

        test('should return 403 for secrets owned by other users', async () => {
            // Create another user
            const otherUser = {
                userName: 'otheruserdetails',
                gender: 'female',
                email: 'otherdetails@example.com',
                password: 'password123'
            };

            const otherUserRes = await request(app)
                .post('/api/auth/register')
                .send(otherUser);

            expect(otherUserRes.statusCode).toBe(201);
            const otherToken = otherUserRes.body.tokens.access.token;

            // Try to access first user's secret
            const res = await request(app)
                .get(`/api/secret/me/secrets/${secretId}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.statusCode).toBe(403);
        });

        test('should require authentication', async () => {
            const res = await request(app)
                .get(`/api/secret/me/secrets/${secretId}`);

            expect(res.statusCode).toBe(401);
        });

        test('should return 404 for non-existent secret', async () => {
            const fakeId = '550e8400-e29b-41d4-a716-446655440000';
            const res = await request(app)
                .get(`/api/secret/me/secrets/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/secret/me/secrets/:id - Revoke secret', () => {
        let secretId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ 
                    content: 'Secret to revoke',
                    title: 'Revoke Test'
                });

            secretId = res.body.accessUrl.split('/').pop();
        });

        test('should successfully revoke unviewed secret', async () => {
            const res = await request(app)
                .delete(`/api/secret/me/secrets/${secretId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Secret revoked successfully');

            // Verify secret is revoked in database
            const secret = await Secret.findOne({ id: secretId });
            expect(secret.isRevoked).toBe(true);
            expect(secret.revokedAt).toBeTruthy();
        });

        test('should not allow revoking viewed secret', async () => {
            // View the secret first
            await request(app)
                .get(`/api/secret/${secretId}`);

            // Try to revoke
            const res = await request(app)
                .delete(`/api/secret/me/secrets/${secretId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('viewed');
        });

        test('should not allow revoking already revoked secret', async () => {
            // Revoke once
            await request(app)
                .delete(`/api/secret/me/secrets/${secretId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            // Try to revoke again
            const res = await request(app)
                .delete(`/api/secret/me/secrets/${secretId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('already revoked');
        });

        test('should return 403 for secrets owned by other users', async () => {
            // Create another user
            const otherUser = {
                userName: 'revokeotheruser',
                gender: 'female',
                email: 'revokeother@example.com',
                password: 'password123'
            };

            const otherUserRes = await request(app)
                .post('/api/auth/register')
                .send(otherUser);

            expect(otherUserRes.statusCode).toBe(201);
            const otherToken = otherUserRes.body.tokens.access.token;

            // Try to revoke first user's secret
            const res = await request(app)
                .delete(`/api/secret/me/secrets/${secretId}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.statusCode).toBe(403);
        });

        test('should return 403 for anonymous secrets', async () => {
            // Create anonymous secret
            const anonRes = await request(app)
                .post('/api/secret')
                .send({ content: 'Anonymous secret' });

            const anonSecretId = anonRes.body.accessUrl.split('/').pop();

            // Try to revoke it
            const res = await request(app)
                .delete(`/api/secret/me/secrets/${anonSecretId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(403);
        });

        test('should require authentication', async () => {
            const res = await request(app)
                .delete(`/api/secret/me/secrets/${secretId}`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Secret viewing with history tracking', () => {
        let secretId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Track view history' });

            secretId = res.body.accessUrl.split('/').pop();
        });

        test('should record view history when secret is accessed', async () => {
            const res = await request(app)
                .get(`/api/secret/${secretId}`)
                .set('User-Agent', 'Test Browser');

            expect(res.statusCode).toBe(200);

            // Check view history in database
            const secret = await Secret.findOne({ id: secretId });
            expect(secret.viewHistory).toHaveLength(1);
            expect(secret.viewHistory[0]).toHaveProperty('viewedAt');
            expect(secret.viewHistory[0]).toHaveProperty('ipAddress');
            expect(secret.viewHistory[0]).toHaveProperty('userAgent');
            expect(secret.viewHistory[0].userAgent).toBe('Test Browser');
        });

        test('should show updated status in user secrets list after viewing', async () => {
            // View the secret
            await request(app)
                .get(`/api/secret/${secretId}`);

            // Check user's secrets list
            const res = await request(app)
                .get('/api/secret/me/secrets')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            const viewedSecret = res.body.data.find(s => s.id === secretId);
            expect(viewedSecret.read).toBe(true);
            expect(viewedSecret.readAt).toBeTruthy();
        });
    });

    describe('Filtering and pagination', () => {
        beforeEach(async () => {
            // Create 5 secrets
            for (let i = 1; i <= 5; i++) {
                await request(app)
                    .post('/api/secret')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send({ 
                        content: `Secret ${i}`,
                        title: `Secret ${i}`
                    });
            }
        });

        test('should filter by unviewed status', async () => {
            const res = await request(app)
                .get('/api/secret/me/secrets?status=unviewed')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(5);
            expect(res.body.data.every(s => s.read === false)).toBe(true);
        });

        test('should paginate results', async () => {
            const page1 = await request(app)
                .get('/api/secret/me/secrets?page=1&limit=2')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(page1.statusCode).toBe(200);
            expect(page1.body.data).toHaveLength(2);
            expect(page1.body.pagination.totalPages).toBe(3);

            const page2 = await request(app)
                .get('/api/secret/me/secrets?page=2&limit=2')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(page2.statusCode).toBe(200);
            expect(page2.body.data).toHaveLength(2);
            
            // Should be different secrets
            expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
        });

        test('should sort by creation date descending by default', async () => {
            const res = await request(app)
                .get('/api/secret/me/secrets')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            const dates = res.body.data.map(s => new Date(s.createdAt).getTime());
            
            // Check if sorted descending
            for (let i = 0; i < dates.length - 1; i++) {
                expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
            }
        });
    });

    describe('Mixed anonymous and authenticated secrets', () => {
        test('should only return user-owned secrets, not anonymous ones', async () => {
            // Create user secrets
            await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'User secret 1' });

            await request(app)
                .post('/api/secret')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'User secret 2' });

            // Create anonymous secrets
            await request(app)
                .post('/api/secret')
                .send({ content: 'Anonymous 1' });

            await request(app)
                .post('/api/secret')
                .send({ content: 'Anonymous 2' });

            // Get user's secrets
            const res = await request(app)
                .get('/api/secret/me/secrets')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data.every(s => s.userId === userId)).toBe(true);
        });
    });
});
