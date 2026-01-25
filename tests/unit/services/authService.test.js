require('jest-extended/all');
const authService = require('../../../src/services/authService');
const User = require('../../../src/models/User');
const Token = require('../../../src/models/Token');
const tokenService = require('../../../src/services/tokenService');
const userService = require('../../../src/services/userService');
const ApiError = require('../../../src/utils/apiError');
const httpStatus = require('http-status');
const { TokenType } = require('../../../src/config/tokens');

// Mock dependencies
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/Token');
jest.mock('../../../src/services/tokenService');
jest.mock('../../../src/services/userService');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loginUser', () => {
        test('should successfully login with correct credentials', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            const mockUser = {
                id: 'user123',
                email: email.toLowerCase(),
                isPasswordMatch: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockResolvedValue(mockUser);

            const result = await authService.loginUser(email, password);

            expect(User.findOne).toHaveBeenCalledWith({ email: email.toLowerCase() });
            expect(mockUser.isPasswordMatch).toHaveBeenCalledWith(password);
            expect(result).toBe(mockUser);
        });

        test('should convert email to lowercase', async () => {
            const email = 'TEST@EXAMPLE.COM';
            const mockUser = {
                isPasswordMatch: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockResolvedValue(mockUser);

            await authService.loginUser(email, 'password');

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });

        test('should throw ApiError if user not found', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(authService.loginUser('test@example.com', 'password'))
                .rejects.toThrow(ApiError);
            
            await expect(authService.loginUser('test@example.com', 'password'))
                .rejects.toThrow('Incorrect email or password');
        });

        test('should throw ApiError with 401 status if user not found', async () => {
            User.findOne.mockResolvedValue(null);

            try {
                await authService.loginUser('test@example.com', 'password');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect(error.statusCode).toBe(httpStatus.default.UNAUTHORIZED);
            }
        });

        test('should throw ApiError if password does not match', async () => {
            const mockUser = {
                email: 'test@example.com',
                isPasswordMatch: jest.fn().mockResolvedValue(false)
            };

            User.findOne.mockResolvedValue(mockUser);

            await expect(authService.loginUser('test@example.com', 'wrongpassword'))
                .rejects.toThrow('Incorrect email or password');
        });

        test('should throw 401 ApiError if password is incorrect', async () => {
            const mockUser = {
                isPasswordMatch: jest.fn().mockResolvedValue(false)
            };

            User.findOne.mockResolvedValue(mockUser);

            try {
                await authService.loginUser('test@example.com', 'wrongpassword');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect(error.statusCode).toBe(httpStatus.default.UNAUTHORIZED);
            }
        });
    });

    describe('logoutUser', () => {
        test('should successfully logout with valid refresh token', async () => {
            const refreshToken = 'valid.refresh.token';
            const mockTokenDoc = {
                token: refreshToken,
                type: TokenType.REFRESH,
                deleteOne: jest.fn().mockResolvedValue(true)
            };

            Token.findOne.mockResolvedValue(mockTokenDoc);

            await authService.logoutUser(refreshToken);

            expect(Token.findOne).toHaveBeenCalledWith({ 
                token: refreshToken, 
                type: TokenType.REFRESH 
            });
            expect(mockTokenDoc.deleteOne).toHaveBeenCalled();
        });

        test('should throw ApiError if refresh token not found', async () => {
            Token.findOne.mockResolvedValue(null);

            await expect(authService.logoutUser('invalid.token'))
                .rejects.toThrow(ApiError);
            
            await expect(authService.logoutUser('invalid.token'))
                .rejects.toThrow('Not found');
        });

        test('should throw 404 ApiError if token not found', async () => {
            Token.findOne.mockResolvedValue(null);

            try {
                await authService.logoutUser('invalid.token');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect(error.statusCode).toBe(httpStatus.default.NOT_FOUND);
            }
        });
    });

    describe('refreshAuth', () => {
        test('should successfully refresh tokens with valid refresh token', async () => {
            const refreshToken = 'valid.refresh.token';
            const mockTokenDoc = {
                userId: 'user123',
                deleteOne: jest.fn().mockResolvedValue(true)
            };
            const mockUser = { id: 'user123', email: 'test@example.com' };
            const mockNewTokens = {
                access: { token: 'new.access.token', expires: Date.now() + 900000 },
                refresh: { token: 'new.refresh.token', expires: Date.now() + 604800000 }
            };

            tokenService.verifyToken.mockResolvedValue(mockTokenDoc);
            userService.getUserById.mockResolvedValue(mockUser);
            tokenService.generateAuthTokens.mockResolvedValue(mockNewTokens);

            const result = await authService.refreshAuth(refreshToken);

            expect(tokenService.verifyToken).toHaveBeenCalledWith(refreshToken, TokenType.REFRESH);
            expect(userService.getUserById).toHaveBeenCalledWith('user123');
            expect(mockTokenDoc.deleteOne).toHaveBeenCalled();
            expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(mockUser);
            expect(result).toBe(mockNewTokens);
        });

        test('should delete old refresh token before generating new ones', async () => {
            const mockTokenDoc = {
                userId: 'user123',
                deleteOne: jest.fn().mockResolvedValue(true)
            };
            const mockUser = { id: 'user123' };

            tokenService.verifyToken.mockResolvedValue(mockTokenDoc);
            userService.getUserById.mockResolvedValue(mockUser);
            tokenService.generateAuthTokens.mockResolvedValue({});

            await authService.refreshAuth('token');

            expect(mockTokenDoc.deleteOne).toHaveBeenCalled();
            expect(mockTokenDoc.deleteOne).toHaveBeenCalledBefore(
                tokenService.generateAuthTokens
            );
        });

        test('should throw 401 ApiError if user not found', async () => {
            const mockTokenDoc = {
                userId: 'user123',
                deleteOne: jest.fn()
            };

            tokenService.verifyToken.mockResolvedValue(mockTokenDoc);
            userService.getUserById.mockResolvedValue(null);

            try {
                await authService.refreshAuth('token');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect(error.statusCode).toBe(httpStatus.default.UNAUTHORIZED);
                expect(error.message).toContain('authenticate');
            }
        });

        test('should throw 401 ApiError if token verification fails', async () => {
            tokenService.verifyToken.mockRejectedValue(new Error('Invalid token'));

            try {
                await authService.refreshAuth('invalid.token');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect(error.statusCode).toBe(httpStatus.default.UNAUTHORIZED);
            }
        });

        test('should catch and wrap any errors as 401 ApiError', async () => {
            tokenService.verifyToken.mockRejectedValue(new Error('Database error'));

            await expect(authService.refreshAuth('token'))
                .rejects.toThrow(ApiError);

            try {
                await authService.refreshAuth('token');
            } catch (error) {
                expect(error.statusCode).toBe(httpStatus.default.UNAUTHORIZED);
                expect(error.message).toBe('Please authenticate');
            }
        });
    });
});
