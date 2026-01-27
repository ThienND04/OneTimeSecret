const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const config = require('../../../src/config/config');

const TMP_DIR = path.join(__dirname, 'tmp_test_uploads');
let createdFiles = [];

/**
 * Creates a temporary file for testing
 * @param {string} name - File name
 * @param {string} content - File content
 * @returns {string} - Full path to the created file
 */
const createTempFile = (name, content = 'test content') => {
    if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
    }
    const filePath = path.join(TMP_DIR, name);
    fs.writeFileSync(filePath, content);
    createdFiles.push(filePath);
    return filePath;
};

/**
 * Deletes a temporary file
 * @param {string} filePath - Path to file to delete
 */
const deleteTempFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

/**
 * Helper to create a secret with file and return the secret ID
 */
const createSecretWithFile = async (options = {}) => {
    const {
        content = 'Test secret content',
        password = null,
        fileName = 'testfile.txt',
        fileContent = 'Test file content',
    } = options;

    let req = request(app)
        .post('/api/secret')
        .field('content', content);

    if (password) {
        req = req.field('password', password);
    }

    const res = await req.attach('files', createTempFile(fileName, fileContent));

    return {
        response: res,
        secretId: res.body.accessUrl?.split('/').pop(),
    };
};

beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
});

afterAll(async () => {
    await mongoose.connection.close();
    // Clean up test tmp directory
    if (fs.existsSync(TMP_DIR)) {
        fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
    // Clean up server tmp_uploads
    const serverTmpDir = path.join(__dirname, '../../..', 'src', 'tmp_uploads');
    if (fs.existsSync(serverTmpDir)) {
        fs.rmSync(serverTmpDir, { recursive: true, force: true });
    }
});

afterEach(() => {
    createdFiles.forEach(deleteTempFile);
    createdFiles = [];
});

describe('Secret API with files upload', () => {
    describe('POST /api/secret - Create secret with file', () => {
        test('should create a secret with a single file', async () => {
            const { response } = await createSecretWithFile({
                content: 'Secret with file',
                fileName: 'document.txt',
                fileContent: 'Document content',
            });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('accessUrl');
            expect(response.body).toHaveProperty('message', 'Secret created');
        });

        test('should create a secret with file and password', async () => {
            const { response } = await createSecretWithFile({
                content: 'Protected secret',
                password: 'mypassword123',
                fileName: 'protected.txt',
                fileContent: 'Protected content',
            });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('accessUrl');
        });

        test('should create a secret with multiple files (up to 3)', async () => {
            const res = await request(app)
                .post('/api/secret')
                .field('content', 'Secret with multiple files')
                .attach('files', createTempFile('file1.txt', 'Content 1'))
                .attach('files', createTempFile('file2.txt', 'Content 2'))
                .attach('files', createTempFile('file3.txt', 'Content 3'));

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('accessUrl');
        });

        test('should reject file larger than 3MB', async () => {
            const largeContent = 'a'.repeat(4 * 1024 * 1024); // 4 MB
            const res = await request(app)
                .post('/api/secret')
                .field('content', 'Secret with large file')
                .attach('files', createTempFile('large.txt', largeContent));

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'File size should not exceed 3MB.');
        });

        test('should reject more than 3 files', async () => {
            const res = await request(app)
                .post('/api/secret')
                .field('content', 'Too many files')
                .attach('files', createTempFile('file1.txt', 'content'))
                .attach('files', createTempFile('file2.txt', 'content'))
                .attach('files', createTempFile('file3.txt', 'content'))
                .attach('files', createTempFile('file4.txt', 'content'));

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'You can only upload up to 3 files.');
        });
    });

    describe('GET /api/secret/:id - Read secret with file', () => {
        test('should read secret with file (no password)', async () => {
            const { secretId } = await createSecretWithFile({
                content: 'Readable secret',
                fileName: 'readable.txt',
                fileContent: 'Readable file content',
            });

            const res = await request(app)
                .get(`/api/secret/${secretId}`)
                .send();

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('content', 'Readable secret');
            expect(res.body).toHaveProperty('files');
            expect(res.body.files).toBeInstanceOf(Array);
            expect(res.body.files.length).toBe(1);
            expect(res.body.files[0]).toMatchObject({
                originalName: 'readable.txt',
                mimeType: 'text/plain',
            });
            expect(res.body.files[0]).toHaveProperty('url');
            expect(res.body.files[0]).toHaveProperty('filename');
        });

        test('should read secret with file using correct password', async () => {
            const { secretId } = await createSecretWithFile({
                content: 'Password protected content',
                password: 'secretpass',
                fileName: 'protected.txt',
                fileContent: 'Protected file',
            });

            const res = await request(app)
                .get(`/api/secret/${secretId}`)
                .send({ password: 'secretpass' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('content', 'Password protected content');
            expect(res.body.files).toHaveLength(1);
        });

        test('should reject access without password when required', async () => {
            const { secretId } = await createSecretWithFile({
                content: 'Protected secret',
                password: 'requiredpass',
            });

            const res = await request(app)
                .get(`/api/secret/${secretId}`)
                .send();

            expect(res.statusCode).toBe(401);
            expect(res.text).toMatch(/Password is required to access this secret/i);
        });

        test('should reject access with incorrect password', async () => {
            const { secretId } = await createSecretWithFile({
                content: 'Protected secret',
                password: 'correctpass',
            });

            const res = await request(app)
                .get(`/api/secret/${secretId}`)
                .send({ password: 'wrongpass' });

            expect(res.statusCode).toBe(403);
            expect(res.text).toMatch(/Incorrect password/i);
        });

        test('should destroy secret after first read (one-time access)', async () => {
            const { secretId } = await createSecretWithFile({
                content: 'One-time secret',
            });

            // First read - should succeed
            const firstRead = await request(app)
                .get(`/api/secret/${secretId}`)
                .send();
            expect(firstRead.statusCode).toBe(200);

            // Second read - should fail
            const secondRead = await request(app)
                .get(`/api/secret/${secretId}`)
                .send();
            expect(secondRead.statusCode).toBe(410);
            expect(secondRead.text).toMatch(/already viewed/i);
        });

        test('should return 404 for non-existent secret', async () => {
            // Use a valid UUID format that doesn't exist
            const fakeUuid = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/secret/${fakeUuid}`)
                .send();

            expect(res.statusCode).toBe(404);
            expect(res.text).toMatch(/not found/i);
        });
    });

    describe('File metadata validation', () => {
        test('should preserve original filename in metadata', async () => {
            const { secretId } = await createSecretWithFile({
                content: 'Test content',
                fileName: 'my-document.txt',
                fileContent: 'File content here',
            });

            const res = await request(app)
                .get(`/api/secret/${secretId}`)
                .send();

            expect(res.statusCode).toBe(200);
            expect(res.body.files[0].originalName).toBe('my-document.txt');
        });

        test('should detect correct mime type for text file', async () => {
            const { secretId } = await createSecretWithFile({
                content: 'Test',
                fileName: 'test.txt',
            });

            const res = await request(app)
                .get(`/api/secret/${secretId}`)
                .send();

            expect(res.body.files[0].mimeType).toBe('text/plain');
        });
    });
});