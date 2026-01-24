const pick = require('../../../src/utils/pick');

describe('Pick Utility', () => {
    describe('Basic functionality', () => {
        test('should pick specified keys from object', () => {
            const obj = { name: 'John', age: 30, email: 'john@example.com', city: 'NYC' };
            const result = pick(obj, ['name', 'email']);
            
            expect(result).toEqual({ name: 'John', email: 'john@example.com' });
            expect(result).not.toHaveProperty('age');
            expect(result).not.toHaveProperty('city');
        });

        test('should return empty object when picking empty keys array', () => {
            const obj = { name: 'John', age: 30 };
            const result = pick(obj, []);
            
            expect(result).toEqual({});
        });

        test('should return empty object when picking from empty object', () => {
            const obj = {};
            const result = pick(obj, ['name', 'age']);
            
            expect(result).toEqual({});
        });
    });

    describe('Edge cases', () => {
        test('should handle null object gracefully', () => {
            const result = pick(null, ['name', 'age']);
            
            expect(result).toEqual({});
        });

        test('should handle undefined object gracefully', () => {
            const result = pick(undefined, ['name', 'age']);
            
            expect(result).toEqual({});
        });

        test('should ignore non-existing keys', () => {
            const obj = { name: 'John', age: 30 };
            const result = pick(obj, ['name', 'email', 'city']);
            
            expect(result).toEqual({ name: 'John' });
            expect(result).not.toHaveProperty('email');
            expect(result).not.toHaveProperty('city');
        });

        test('should pick keys with falsy values', () => {
            const obj = { name: '', age: 0, isActive: false, data: null, info: undefined };
            const result = pick(obj, ['name', 'age', 'isActive', 'data', 'info']);
            
            expect(result).toEqual({ 
                name: '', 
                age: 0, 
                isActive: false, 
                data: null,
                info: undefined 
            });
        });

        test('should not pick inherited properties', () => {
            const proto = { inherited: 'value' };
            const obj = Object.create(proto);
            obj.own = 'ownValue';
            
            const result = pick(obj, ['own', 'inherited']);
            
            expect(result).toEqual({ own: 'ownValue' });
            expect(result).not.toHaveProperty('inherited');
        });
    });

    describe('Real-world use cases', () => {
        test('should pick request body fields for validation', () => {
            const req = {
                body: { email: 'test@example.com', password: '123456' },
                query: { page: 1 },
                params: { id: '123' }
            };
            const result = pick(req, ['body', 'query']);
            
            expect(result).toEqual({
                body: { email: 'test@example.com', password: '123456' },
                query: { page: 1 }
            });
            expect(result).not.toHaveProperty('params');
        });

        test('should pick user safe fields for response', () => {
            const user = {
                id: '123',
                userName: 'john_doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                createdAt: new Date('2024-01-01'),
                __v: 0
            };
            const result = pick(user, ['id', 'userName', 'email', 'createdAt']);
            
            expect(result).toEqual({
                id: '123',
                userName: 'john_doe',
                email: 'john@example.com',
                createdAt: new Date('2024-01-01')
            });
            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('__v');
        });

        test('should work with nested objects as values', () => {
            const data = {
                user: { name: 'John', age: 30 },
                settings: { theme: 'dark' },
                metadata: { version: '1.0' }
            };
            const result = pick(data, ['user', 'settings']);
            
            expect(result).toEqual({
                user: { name: 'John', age: 30 },
                settings: { theme: 'dark' }
            });
            expect(result).not.toHaveProperty('metadata');
        });

        test('should work with arrays as values', () => {
            const data = {
                items: [1, 2, 3],
                tags: ['javascript', 'node'],
                count: 5
            };
            const result = pick(data, ['items', 'tags']);
            
            expect(result).toEqual({
                items: [1, 2, 3],
                tags: ['javascript', 'node']
            });
        });
    });

    describe('Type safety', () => {
        test('should maintain original object types', () => {
            const obj = {
                str: 'string',
                num: 42,
                bool: true,
                arr: [1, 2, 3],
                obj: { nested: 'value' },
                date: new Date('2024-01-01')
            };
            const result = pick(obj, ['str', 'num', 'bool', 'arr', 'obj', 'date']);
            
            expect(typeof result.str).toBe('string');
            expect(typeof result.num).toBe('number');
            expect(typeof result.bool).toBe('boolean');
            expect(Array.isArray(result.arr)).toBe(true);
            expect(typeof result.obj).toBe('object');
            expect(result.date instanceof Date).toBe(true);
        });

        test('should not mutate original object', () => {
            const original = { name: 'John', age: 30, email: 'john@example.com' };
            const originalCopy = { ...original };
            
            const result = pick(original, ['name', 'email']);
            
            expect(original).toEqual(originalCopy);
            expect(result).not.toBe(original);
        });
    });
});
    