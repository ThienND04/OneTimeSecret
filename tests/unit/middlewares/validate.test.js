const validate = require('../../../src/middlewares/validate');
const ApiError = require('../../../src/utils/apiError');
const httpStatus = require('http-status');
const { z } = require('zod');

describe('Validate Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {}
        };
        res = {};
        next = jest.fn();
    });

    describe('Basic validation', () => {
        test('should validate body successfully', () => {
            const schema = {
                body: z.object({
                    email: z.string().email(),
                    password: z.string().min(6)
                })
            };

            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(next).not.toHaveBeenCalledWith(expect.any(ApiError));
        });

        test('should validate params successfully', () => {
            const schema = {
                params: z.object({
                    id: z.string().uuid()
                })
            };

            req.params = {
                id: '123e4567-e89b-12d3-a456-426614174000'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should validate query successfully', () => {
            const schema = {
                query: z.object({
                    page: z.string(),
                    limit: z.string()
                })
            };

            req.query = {
                page: '1',
                limit: '10'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should validate multiple parts (body, params, query)', () => {
            const schema = {
                params: z.object({ id: z.string() }),
                query: z.object({ include: z.string().optional() }),
                body: z.object({ name: z.string() })
            };

            req.params = { id: '123' };
            req.query = { include: 'details' };
            req.body = { name: 'John' };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('Validation errors', () => {
        test('should call next with ApiError on validation failure', () => {
            const schema = {
                body: z.object({
                    email: z.string().email()
                })
            };

            req.body = {
                email: 'invalid-email'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });

        test('should return 400 status code on validation error', () => {
            const schema = {
                body: z.object({
                    age: z.number()
                })
            };

            req.body = {
                age: 'not-a-number'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            const error = next.mock.calls[0][0];
            expect(error.statusCode).toBe(httpStatus.default.BAD_REQUEST);
        });

        test('should include validation error message', () => {
            const schema = {
                body: z.object({
                    email: z.string().email('Invalid email format')
                })
            };

            req.body = {
                email: 'bad-email'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Validation error');
            expect(error.message).toContain('Invalid email format');
        });

        test('should combine multiple error messages', () => {
            const schema = {
                body: z.object({
                    email: z.string().email(),
                    password: z.string().min(6)
                })
            };

            req.body = {
                email: 'invalid',
                password: '123'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Validation error');
        });

        test('should handle missing required fields', () => {
            const schema = {
                body: z.object({
                    username: z.string(),
                    email: z.string().email()
                })
            };

            req.body = {}; // Empty body

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });

    describe('Schema filtering', () => {
        test('should only validate specified parts', () => {
            const schema = {
                body: z.object({ name: z.string() }),
                extraField: z.object({ should: z.string() }) // Not a valid part
            };

            req.body = { name: 'John' };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should ignore unspecified request parts', () => {
            const schema = {
                body: z.object({ email: z.string().email() })
            };

            req.body = { email: 'test@example.com' };
            req.query = { page: '1' }; // Not in schema, should be ignored
            req.params = { id: '123' }; // Not in schema, should be ignored

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('Data transformation', () => {
        test('should assign validated data to request object', () => {
            const schema = {
                body: z.object({
                    age: z.string().transform(val => parseInt(val, 10))
                })
            };

            req.body = { age: '25' };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(req.body.age).toBe(25);
            expect(typeof req.body.age).toBe('number');
        });

        test('should preserve original request for non-validated parts', () => {
            const schema = {
                body: z.object({ name: z.string() })
            };

            req.body = { name: 'John' };
            req.headers = { authorization: 'Bearer token' };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(req.headers).toEqual({ authorization: 'Bearer token' });
        });
    });

    describe('Real-world scenarios', () => {
        test('should validate user registration data', () => {
            const registerSchema = {
                body: z.object({
                    userName: z.string().min(3),
                    email: z.string().email(),
                    password: z.string().min(6),
                    gender: z.enum(['male', 'female', 'helicopter'])
                })
            };

            req.body = {
                userName: 'john_doe',
                email: 'john@example.com',
                password: 'secure123',
                gender: 'male'
            };

            const middleware = validate(registerSchema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should validate secret creation with optional fields', () => {
            const secretSchema = {
                body: z.object({
                    content: z.string().min(1),
                    password: z.string().optional(),
                    is_client_encrypted: z.boolean().default(false)
                })
            };

            req.body = {
                content: 'My secret message'
            };

            const middleware = validate(secretSchema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(req.body.is_client_encrypted).toBe(false);
        });

        test('should validate UUID in params', () => {
            const schema = {
                params: z.object({
                    id: z.string().uuid('Invalid UUID format')
                })
            };

            req.params = {
                id: '550e8400-e29b-41d4-a716-446655440000'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should reject invalid UUID in params', () => {
            const schema = {
                params: z.object({
                    id: z.string().uuid()
                })
            };

            req.params = {
                id: 'not-a-uuid'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });

        test('should validate pagination query parameters', () => {
            const schema = {
                query: z.object({
                    page: z.string().transform(val => parseInt(val, 10)),
                    limit: z.string().transform(val => parseInt(val, 10))
                })
            };

            req.query = {
                page: '2',
                limit: '20'
            };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(req.query.page).toBe(2);
            expect(req.query.limit).toBe(20);
        });
    });

    describe('Edge cases', () => {
        test('should handle empty schema', () => {
            const schema = {};

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        test('should handle null request values', () => {
            const schema = {
                body: z.object({
                    value: z.string().nullable()
                })
            };

            req.body = { value: null };

            const middleware = validate(schema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });
    });
});
