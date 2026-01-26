require('jest-extended/all')
const userService = require('../../../src/services/userService');
const User = require('../../../src/models/User');
const ApiError = require('../../../src/utils/apiError');
const httpStatus = require('http-status');

// Mock dependencies
jest.mock('../../../src/models/User');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        test('should successfully create a new user', async () => {
            const userData = {
                userName: 'john_doe',
                email: 'john@example.com',
                password: 'password123',
                gender: 'male'
            };

            const mockCreatedUser = {
                id: 'user123',
                ...userData,
                password: 'hashed_password',
                createdAt: new Date()
            };

            User.isEmailExist.mockResolvedValue(false);
            User.create.mockResolvedValue(mockCreatedUser);

            const result = await userService.createUser(userData);

            expect(User.isEmailExist).toHaveBeenCalledWith(userData.email);
            expect(User.create).toHaveBeenCalledWith(userData);
            expect(result).toBe(mockCreatedUser);
        });

        test('should check if email exists before creating user', async () => {
            const userData = {
                userName: 'test',
                email: 'test@example.com',
                password: 'pass123',
                gender: 'male'
            };

            User.isEmailExist.mockResolvedValue(false);
            User.create.mockResolvedValue({});

            await userService.createUser(userData);

            expect(User.isEmailExist).toHaveBeenCalledWith(userData.email);
            expect(User.isEmailExist).toHaveBeenCalledBefore(User.create);
        });

        test('should throw ApiError if email already exists', async () => {
            const userData = {
                userName: 'john_doe',
                email: 'existing@example.com',
                password: 'password123',
                gender: 'male'
            };

            User.isEmailExist.mockResolvedValue(true);

            await expect(userService.createUser(userData))
                .rejects.toThrow(ApiError);
            
            await expect(userService.createUser(userData))
                .rejects.toThrow('Email already in use');
        });

        test('should throw 400 ApiError if email exists', async () => {
            const userData = {
                email: 'existing@example.com',
                userName: 'test',
                password: 'pass',
                gender: 'male'
            };

            User.isEmailExist.mockResolvedValue(true);

            try {
                await userService.createUser(userData);
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect(error.statusCode).toBe(httpStatus.default.BAD_REQUEST);
            }
        });

        test('should not call User.create if email exists', async () => {
            const userData = {
                email: 'existing@example.com',
                userName: 'test',
                password: 'pass',
                gender: 'male'
            };

            User.isEmailExist.mockResolvedValue(true);

            try {
                await userService.createUser(userData);
            } catch (error) {
                expect(User.create).not.toHaveBeenCalled();
            }
        });

        test('should handle case-sensitive email check', async () => {
            const userData = {
                userName: 'test',
                email: 'Test@Example.COM',
                password: 'pass123',
                gender: 'female'
            };

            User.isEmailExist.mockResolvedValue(false);
            User.create.mockResolvedValue({});

            await userService.createUser(userData);

            expect(User.isEmailExist).toHaveBeenCalledWith('Test@Example.COM');
        });

        test('should create user with all gender options', async () => {
            const genders = ['male', 'female', 'helicopter'];

            User.isEmailExist.mockResolvedValue(false);

            for (const gender of genders) {
                const userData = {
                    userName: `user_${gender}`,
                    email: `${gender}@example.com`,
                    password: 'password123',
                    gender
                };

                User.create.mockResolvedValue({ ...userData, id: 'user123' });

                const result = await userService.createUser(userData);

                expect(result.gender).toBe(gender);
            }
        });
    });

    describe('getUserById', () => {
        test('should return user by id', async () => {
            const userId = 'user123';
            const mockUser = {
                id: userId,
                userName: 'john_doe',
                email: 'john@example.com',
                gender: 'male'
            };

            User.findById.mockResolvedValue(mockUser);

            const result = await userService.getUserById(userId);

            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(result).toBe(mockUser);
        });

        test('should return null if user not found', async () => {
            User.findById.mockResolvedValue(null);

            const result = await userService.getUserById('nonexistent');

            expect(result).toBeNull();
        });

        test('should handle MongoDB ObjectId', async () => {
            const objectId = '507f1f77bcf86cd799439011';
            const mockUser = { id: objectId, userName: 'test' };

            User.findById.mockResolvedValue(mockUser);

            const result = await userService.getUserById(objectId);

            expect(User.findById).toHaveBeenCalledWith(objectId);
            expect(result).toBe(mockUser);
        });

        test('should propagate database errors', async () => {
            const dbError = new Error('Database connection failed');
            User.findById.mockRejectedValue(dbError);

            await expect(userService.getUserById('user123'))
                .rejects.toThrow('Database connection failed');
        });
    });

    describe('Real-world scenarios', () => {
        test('should handle concurrent user creation attempts', async () => {
            const userData1 = {
                userName: 'user1',
                email: 'test@example.com',
                password: 'pass1',
                gender: 'male'
            };

            const userData2 = {
                userName: 'user2',
                email: 'test@example.com',
                password: 'pass2',
                gender: 'female'
            };

            // First call succeeds
            User.isEmailExist.mockResolvedValueOnce(false);
            User.create.mockResolvedValueOnce({ id: 'user1', ...userData1 });

            // Second call should fail (email now exists)
            User.isEmailExist.mockResolvedValueOnce(true);

            const result1 = await userService.createUser(userData1);
            expect(result1.id).toBe('user1');

            await expect(userService.createUser(userData2))
                .rejects.toThrow('Email already in use');
        });

        test('should preserve user data structure', async () => {
            const userData = {
                userName: 'test_user',
                email: 'test@example.com',
                password: 'SecureP@ss123',
                gender: 'helicopter'
            };

            User.isEmailExist.mockResolvedValue(false);
            User.create.mockResolvedValue({
                id: 'newid',
                ...userData,
                createdAt: new Date(),
                password: 'hashed_version'
            });

            const result = await userService.createUser(userData);

            expect(result.userName).toBe(userData.userName);
            expect(result.email).toBe(userData.email);
            expect(result.gender).toBe(userData.gender);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('createdAt');
        });
    });
});
