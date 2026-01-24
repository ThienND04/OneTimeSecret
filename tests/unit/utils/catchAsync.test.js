const catchAsync = require('../../../src/utils/catchAsync');

describe('CatchAsync Utility', () => {
    describe('Successful execution', () => {
        test('should execute async function successfully', async () => {
            const mockFn = jest.fn(async (req, res) => {
                res.json({ success: true });
            });
            const req = {};
            const res = { json: jest.fn() };
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);

            expect(mockFn).toHaveBeenCalledWith(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ success: true });
            expect(next).not.toHaveBeenCalled();
        });

        test('should pass all arguments to wrapped function', async () => {
            const mockFn = jest.fn(async (req, res, next) => {
                return 'result';
            });
            const req = { body: { test: 'data' } };
            const res = { send: jest.fn() };
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);

            expect(mockFn).toHaveBeenCalledWith(req, res, next);
        });

        test('should work with synchronous functions', async () => {
            const mockFn = jest.fn((req, res) => {
                res.status(200).send('OK');
            });
            const req = {};
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);

            expect(mockFn).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('OK');
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        test('should catch and forward async errors to next', async () => {
            const error = new Error('Async error');
            const mockFn = jest.fn(async () => {
                throw error;
            });
            const req = {};
            const res = {};
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledTimes(1);
        });

        test('should catch and forward rejected promises to next', async () => {
            const error = new Error('Promise rejection');
            const mockFn = jest.fn(() => Promise.reject(error));
            const req = {};
            const res = {};
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test('should handle errors thrown in async operations', async () => {
            const mockFn = jest.fn(async () => {
                throw new Error('Database error');
            });
            const req = {};
            const res = {};
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Database error');
        });

        test('should handle custom error objects', async () => {
            const customError = { statusCode: 404, message: 'Not found' };
            const mockFn = jest.fn(async () => {
                throw customError;
            });
            const req = {};
            const res = {};
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);

            expect(next).toHaveBeenCalledWith(customError);
        });
    });

    describe('Real-world scenarios', () => {
        test('should handle database query errors', async () => {
            const dbError = new Error('Connection timeout');
            const mockFn = jest.fn(async (req, res) => {
                // Simulate database query
                await Promise.reject(dbError);
            });
            const req = { params: { id: '123' } };
            const res = {};
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);
            await new Promise(process.nextTick); 

            expect(next).toHaveBeenCalledWith(dbError);
        });

        test('should handle validation errors', async () => {
            const validationError = new Error('Invalid input');
            const mockFn = jest.fn(async (req, res) => {
                if (!req.body.email) {
                    throw validationError;
                }
            });
            const req = { body: {} };
            const res = {};
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);

            expect(next).toHaveBeenCalledWith(validationError);
        });

        test('should handle successful API response', async () => {
            const mockFn = jest.fn(async (req, res) => {
                const data = { id: 1, name: 'Test' };
                res.status(200).json(data);
            });
            const req = {};
            const res = { 
                status: jest.fn().mockReturnThis(), 
                json: jest.fn() 
            };
            const next = jest.fn();

            const wrappedFn = catchAsync(mockFn);
            await wrappedFn(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Test' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should work with controller methods', async () => {
            const controller = {
                getUser: catchAsync(async (req, res) => {
                    const user = { id: req.params.id, name: 'John' };
                    res.json(user);
                })
            };
            const req = { params: { id: '123' } };
            const res = { json: jest.fn() };
            const next = jest.fn();

            await controller.getUser(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ id: '123', name: 'John' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Return value', () => {
        test('should return a function', () => {
            const mockFn = jest.fn();
            const wrappedFn = catchAsync(mockFn);

            expect(typeof wrappedFn).toBe('function');
        });

        test('should return a function that accepts req, res, next', () => {
            const mockFn = jest.fn();
            const wrappedFn = catchAsync(mockFn);

            expect(wrappedFn.length).toBe(3); // Express middleware signature
        });
    });
});
