const request = require('supertest');
const app = require('../../../app');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { any } = require('../../../middlewares/upload');
require('dotenv').config();

let createdFiles = [];
const createTempFile =  (name, content = 'test content') =>  {
    const filePath = path.join(__dirname, name);
    fs.writeFileSync(filePath, content);
    createdFiles.push(filePath);
    console.log(`Temporary file created: ${filePath}`);
    return filePath;
};

const deleteTempFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

beforeAll(async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();

    fs.rmdirSync(path.join(__dirname, '../../..', 'tmp_uploads'), { recursive: true, force: true });
});

afterEach(() => {
    for (const file of createdFiles) {
        deleteTempFile(file);
    }
    createdFiles = [];
});

describe('Secret API with files upload', () => {
    let secretIdWithFile;

    test('should create a new secret with file', async () => {
        console.log('Creating secret with file');
        const res = await request(app)
            .post('/api/secret')
            .field('content', 'This is a secret with file and password')
            .field('password', 'testpassword')
            .attach('files', createTempFile('testfile.txt', 'This is a test file content'))

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('accessUrl');

        const id = res.body.accessUrl.split('/').pop();
        secretIdWithFile = id;
    });

    test('should read the secret with file and password', async () => {
        const res = await request(app)
            .get(`/api/secret/${secretIdWithFile}`)
            .query({ password: 'testpassword' })
            .send();

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content', 'This is a secret with file and password');
        expect(res.body).toHaveProperty('files');
        expect(res.body.files).toBeInstanceOf(Array);
        expect(res.body.files.length).toBeGreaterThan(0);
        expect(res.body.files[0]).toHaveProperty('url');
        expect(res.body.files[0]).toHaveProperty('originalName', 'testfile.txt');
        expect(res.body.files[0]).toHaveProperty('mimeType', 'text/plain');
        expect(res.body.files[0]).toHaveProperty('filename');
    });

    test('should error with a file larger 3Mb', async () => {
        console.log('Creating secret with large file size');
        
        const res = await request(app)
            .post('/api/secret')
            .field('content', 'This is a secret with file and password')
            .field('password', 'testpassword')
            .attach('files', createTempFile('testfile.txt', 'a'.repeat(4 * 1024 * 1024))) // 4 MB file
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'File size should not exceed 3MB.');
    });

    test('should error with creating more than 3 files', async () => {
        console.log('Creating secret with large file size');
        
        const res = await request(app)
            .post('/api/secret')
            .field('content', 'This is a secret with file and password')
            .field('password', 'testpassword')
            .attach('files', createTempFile('testfile.txt', 'content'))
            .attach('files', createTempFile('testfile2.txt', 'content'))
            .attach('files', createTempFile('testfile3.txt', 'content'))
            .attach('files', createTempFile('testfile4.txt', 'content'));
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'You can only upload up to 3 files.');
    });
});