const limitFileCount = require('../../../src/middlewares/limitFileCount');

describe('LimitFileCount Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            files: []
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('Basic functionality', () => {
        test('should allow files within limit', () => {
            const middleware = limitFileCount('attachments', 3);
            
            req.files = [
                { fieldname: 'attachments', filename: 'file1.pdf' },
                { fieldname: 'attachments', filename: 'file2.pdf' }
            ];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should allow exactly max count', () => {
            const middleware = limitFileCount('files', 3);
            
            req.files = [
                { fieldname: 'files', filename: 'file1.pdf' },
                { fieldname: 'files', filename: 'file2.pdf' },
                { fieldname: 'files', filename: 'file3.pdf' }
            ];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should reject files exceeding limit', () => {
            const middleware = limitFileCount('files', 3);
            
            req.files = [
                { fieldname: 'files', filename: 'file1.pdf' },
                { fieldname: 'files', filename: 'file2.pdf' },
                { fieldname: 'files', filename: 'file3.pdf' },
                { fieldname: 'files', filename: 'file4.pdf' }
            ];

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Too many files in 'files' field. Max allowed: 3"
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('should filter by field name', () => {
            const middleware = limitFileCount('documents', 2);
            
            req.files = [
                { fieldname: 'documents', filename: 'doc1.pdf' },
                { fieldname: 'documents', filename: 'doc2.pdf' },
                { fieldname: 'images', filename: 'img1.jpg' },
                { fieldname: 'images', filename: 'img2.jpg' },
                { fieldname: 'images', filename: 'img3.jpg' }
            ];

            middleware(req, res, next);

            // Should only count 'documents' field (2 files), not 'images'
            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should allow zero files', () => {
            const middleware = limitFileCount('files', 3);
            req.files = [];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('Edge cases', () => {
        test('should handle undefined req.files', () => {
            const middleware = limitFileCount('files', 3);
            req.files = undefined;

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should handle null req.files', () => {
            const middleware = limitFileCount('files', 3);
            req.files = null;

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should handle empty array', () => {
            const middleware = limitFileCount('files', 1);
            req.files = [];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should handle limit of 0', () => {
            const middleware = limitFileCount('files', 0);
            
            req.files = [
                { fieldname: 'files', filename: 'file1.pdf' }
            ];

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Too many files in 'files' field. Max allowed: 0"
            });
        });

        test('should handle limit of 1', () => {
            const middleware = limitFileCount('avatar', 1);
            
            req.files = [
                { fieldname: 'avatar', filename: 'profile.jpg' }
            ];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should reject when limit 1 exceeded', () => {
            const middleware = limitFileCount('avatar', 1);
            
            req.files = [
                { fieldname: 'avatar', filename: 'profile1.jpg' },
                { fieldname: 'avatar', filename: 'profile2.jpg' }
            ];

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('Multiple field names', () => {
        test('should only count files from specified field', () => {
            const middleware = limitFileCount('documents', 2);
            
            req.files = [
                { fieldname: 'documents', filename: 'doc1.pdf' },
                { fieldname: 'photos', filename: 'photo1.jpg' },
                { fieldname: 'documents', filename: 'doc2.pdf' },
                { fieldname: 'photos', filename: 'photo2.jpg' }
            ];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should reject only when specified field exceeds limit', () => {
            const middleware = limitFileCount('attachments', 2);
            
            req.files = [
                { fieldname: 'attachments', filename: 'file1.pdf' },
                { fieldname: 'attachments', filename: 'file2.pdf' },
                { fieldname: 'attachments', filename: 'file3.pdf' },
                { fieldname: 'other', filename: 'other1.pdf' },
                { fieldname: 'other', filename: 'other2.pdf' }
            ];

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Too many files in 'attachments' field. Max allowed: 2"
            });
        });

        test('should handle case-sensitive field names', () => {
            const middleware = limitFileCount('Files', 2);
            
            req.files = [
                { fieldname: 'files', filename: 'file1.pdf' },
                { fieldname: 'Files', filename: 'file2.pdf' }
            ];

            middleware(req, res, next);

            // Should only count exact match 'Files' (1 file)
            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('Real-world scenarios', () => {
        test('should limit secret file uploads to 3', () => {
            const middleware = limitFileCount('files', 3);
            
            req.files = [
                { fieldname: 'files', filename: 'doc1.pdf', size: 1024 },
                { fieldname: 'files', filename: 'doc2.pdf', size: 2048 },
                { fieldname: 'files', filename: 'doc3.pdf', size: 3072 }
            ];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should reject 4th file upload', () => {
            const middleware = limitFileCount('files', 3);
            
            req.files = [
                { fieldname: 'files', filename: 'file1.pdf' },
                { fieldname: 'files', filename: 'file2.jpg' },
                { fieldname: 'files', filename: 'file3.png' },
                { fieldname: 'files', filename: 'file4.txt' }
            ];

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('should provide clear error message', () => {
            const middleware = limitFileCount('attachments', 5);
            
            req.files = Array(6).fill(null).map((_, i) => ({
                fieldname: 'attachments',
                filename: `file${i + 1}.pdf`
            }));

            middleware(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                error: "Too many files in 'attachments' field. Max allowed: 5"
            });
        });

        test('should work with single file upload field', () => {
            const middleware = limitFileCount('profile_picture', 1);
            
            req.files = [
                { fieldname: 'profile_picture', filename: 'avatar.jpg' }
            ];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('Integration with multer', () => {
        test('should work with multer file structure', () => {
            const middleware = limitFileCount('uploads', 3);
            
            req.files = [
                {
                    fieldname: 'uploads',
                    originalname: 'document.pdf',
                    encoding: '7bit',
                    mimetype: 'application/pdf',
                    size: 12345,
                    filename: 'doc_123456.pdf'
                },
                {
                    fieldname: 'uploads',
                    originalname: 'image.jpg',
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    size: 23456,
                    filename: 'img_123456.jpg'
                }
            ];

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('Return value', () => {
        test('should return a middleware function', () => {
            const middleware = limitFileCount('files', 3);
            expect(typeof middleware).toBe('function');
            expect(middleware.length).toBe(3); // (req, res, next)
        });

        test('should be reusable across requests', () => {
            const middleware = limitFileCount('files', 2);

            // First request
            req.files = [{ fieldname: 'files', filename: 'file1.pdf' }];
            middleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);

            // Second request
            jest.clearAllMocks();
            req.files = [
                { fieldname: 'files', filename: 'file1.pdf' },
                { fieldname: 'files', filename: 'file2.pdf' }
            ];
            middleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });
    });
});
