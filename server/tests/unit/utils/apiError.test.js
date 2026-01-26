const ApiError = require('../../../src/utils/apiError');

describe('ApiError Utility', () => {
    describe('Constructor', () => {
        test('should create an ApiError with all parameters', () => {
            const statusCode = 404;
            const message = 'Resource not found';
            const isOperational = true;
            const stack = 'custom stack trace';

            const error = new ApiError(statusCode, message, isOperational, stack);

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.statusCode).toBe(statusCode);
            expect(error.message).toBe(message);
            expect(error.isOperational).toBe(isOperational);
            expect(error.stack).toBe(stack);
        });

        test('should create an ApiError with default isOperational=true', () => {
            const error = new ApiError(400, 'Bad request');

            expect(error.statusCode).toBe(400);
            expect(error.message).toBe('Bad request');
            expect(error.isOperational).toBe(true);
        });

        test('should auto-generate stack trace when not provided', () => {
            const error = new ApiError(500, 'Internal server error');

            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('apiError');
        });

        test('should use custom stack when provided', () => {
            const customStack = 'Error at line 42';
            const error = new ApiError(500, 'Error', true, customStack);

            expect(error.stack).toBe(customStack);
        });

        test('should set isOperational to false when specified', () => {
            const error = new ApiError(500, 'Programming error', false);

            expect(error.isOperational).toBe(false);
        });
    });

    describe('HTTP Status Codes', () => {
        test('should handle 400 Bad Request', () => {
            const error = new ApiError(400, 'Invalid input');
            expect(error.statusCode).toBe(400);
        });

        test('should handle 401 Unauthorized', () => {
            const error = new ApiError(401, 'Authentication required');
            expect(error.statusCode).toBe(401);
        });

        test('should handle 403 Forbidden', () => {
            const error = new ApiError(403, 'Access denied');
            expect(error.statusCode).toBe(403);
        });

        test('should handle 404 Not Found', () => {
            const error = new ApiError(404, 'Resource not found');
            expect(error.statusCode).toBe(404);
        });

        test('should handle 409 Conflict', () => {
            const error = new ApiError(409, 'Resource already exists');
            expect(error.statusCode).toBe(409);
        });

        test('should handle 410 Gone', () => {
            const error = new ApiError(410, 'Resource no longer available');
            expect(error.statusCode).toBe(410);
        });

        test('should handle 500 Internal Server Error', () => {
            const error = new ApiError(500, 'Something went wrong');
            expect(error.statusCode).toBe(500);
        });
    });

    describe('Error properties', () => {
        test('should have name property as "Error"', () => {
            const error = new ApiError(400, 'Test error');
            expect(error.name).toBe('Error');
        });

        test('should be throwable', () => {
            expect(() => {
                throw new ApiError(400, 'Test error');
            }).toThrow(ApiError);
        });

        test('should be catchable as Error', () => {
            try {
                throw new ApiError(400, 'Test error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(ApiError);
            }
        });
    });

    describe('Real-world scenarios', () => {
        test('should create validation error', () => {
            const error = new ApiError(400, 'Validation error: Email is required');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(true);
        });

        test('should create authentication error', () => {
            const error = new ApiError(401, 'Invalid credentials');
            expect(error.statusCode).toBe(401);
            expect(error.isOperational).toBe(true);
        });

        test('should create authorization error', () => {
            const error = new ApiError(403, 'Insufficient permissions');
            expect(error.statusCode).toBe(403);
            expect(error.isOperational).toBe(true);
        });

        test('should create resource not found error', () => {
            const error = new ApiError(404, 'User not found');
            expect(error.statusCode).toBe(404);
            expect(error.isOperational).toBe(true);
        });

        test('should create programming error (non-operational)', () => {
            const error = new ApiError(500, 'Unexpected error in business logic', false);
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(false);
        });

        test('should create error with detailed message', () => {
            const message = 'Secret already viewed and destroyed';
            const error = new ApiError(410, message);
            
            expect(error.message).toBe(message);
            expect(error.statusCode).toBe(410);
        });
    });
});
