const tokenService = require('../../../src/services/tokenService');
const Token = require('../../../src/models/Token');
const jwt = require('jsonwebtoken');
const { TokenType } = require('../../../src/config/tokens');
const config = require('../../../src/config/config');

// Mock dependencies
jest.mock('../../../src/models/Token');
jest.mock('jsonwebtoken');

describe('TokenService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        test('should generate a valid JWT token', () => {
            const userId = 'user123';
            const expires = 3600; // 1 hour
            const type = TokenType.ACCESS;
            const mockToken = 'mocked.jwt.token';

            jwt.sign.mockReturnValue(mockToken);

            const token = tokenService.generateToken(userId, expires, type);

            expect(jwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    sub: userId,
                    type: type,
                    iat: expect.any(Number),
                    exp: expect.any(Number)
                }),
                config.jwt.secret
            );
            expect(token).toBe(mockToken);
        });

        test('should use custom secret when provided', () => {
            const customSecret = 'custom-secret';
            const mockToken = 'custom.jwt.token';
            jwt.sign.mockReturnValue(mockToken);

            const token = tokenService.generateToken('user123', 3600, TokenType.ACCESS, customSecret);

            expect(jwt.sign).toHaveBeenCalledWith(
                expect.any(Object),
                customSecret
            );
            expect(token).toBe(mockToken);
        });

        test('should set correct expiration time', () => {
            const expires = 7200; // 2 hours
            jwt.sign.mockReturnValue('token');

            tokenService.generateToken('user123', expires, TokenType.REFRESH);

            const payload = jwt.sign.mock.calls[0][0];
            expect(payload.exp - payload.iat).toBe(expires);
        });

        test('should include token type in payload', () => {
            jwt.sign.mockReturnValue('token');

            tokenService.generateToken('user123', 3600, TokenType.ACCESS);

            const payload = jwt.sign.mock.calls[0][0];
            expect(payload.type).toBe(TokenType.ACCESS);
        });
    });

    describe('saveToken', () => {
        test('should save token to database', async () => {
            const token = 'test.token.string';
            const userId = 'user123';
            const type = TokenType.REFRESH;

            const mockTokenDoc = {
                token,
                userId,
                type,
                save: jest.fn().mockResolvedValue(true)
            };

            Token.mockImplementation(() => mockTokenDoc);

            const result = await tokenService.saveToken(token, userId, type);

            expect(Token).toHaveBeenCalledWith({ token, userId, type });
            expect(mockTokenDoc.save).toHaveBeenCalled();
            expect(result).toBe(mockTokenDoc);
        });

        test('should create token with correct fields', async () => {
            const mockTokenDoc = {
                save: jest.fn().mockResolvedValue(true)
            };
            Token.mockImplementation(() => mockTokenDoc);

            await tokenService.saveToken('token', 'userId', TokenType.ACCESS);

            expect(Token).toHaveBeenCalledWith({
                token: 'token',
                userId: 'userId',
                type: TokenType.ACCESS
            });
        });
    });

    describe('verifyToken', () => {
        test('should verify and return token document', async () => {
            const token = 'valid.jwt.token';
            const type = TokenType.REFRESH;
            const userId = 'user123';

            const mockPayload = { sub: userId };
            const mockTokenDoc = { token, userId, type };

            jwt.verify.mockReturnValue(mockPayload);
            Token.findOne.mockResolvedValue(mockTokenDoc);

            const result = await tokenService.verifyToken(token, type);

            expect(jwt.verify).toHaveBeenCalledWith(token, config.jwt.secret);
            expect(Token.findOne).toHaveBeenCalledWith({ token, userId, type });
            expect(result).toBe(mockTokenDoc);
        });

        test('should throw error if token not found in database', async () => {
            const token = 'valid.jwt.token';
            const mockPayload = { sub: 'user123' };

            jwt.verify.mockReturnValue(mockPayload);
            Token.findOne.mockResolvedValue(null);

            await expect(tokenService.verifyToken(token, TokenType.REFRESH))
                .rejects.toThrow('Token not found');
        });

        test('should throw error if JWT verification fails', async () => {
            const token = 'invalid.jwt.token';
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(tokenService.verifyToken(token, TokenType.ACCESS))
                .rejects.toThrow('Invalid token');
        });
    });

    describe('generateAuthTokens', () => {
        test('should generate both access and refresh tokens', async () => {
            const user = { id: 'user123' };
            const accessToken = 'access.token';
            const refreshToken = 'refresh.token';

            jwt.sign
                .mockReturnValueOnce(accessToken)
                .mockReturnValueOnce(refreshToken);

            const mockTokenDoc = {
                save: jest.fn().mockResolvedValue(true)
            };
            Token.mockImplementation(() => mockTokenDoc);

            const result = await tokenService.generateAuthTokens(user);

            expect(jwt.sign).toHaveBeenCalledTimes(2);
            expect(result).toHaveProperty('access');
            expect(result).toHaveProperty('refresh');
            expect(result.access.token).toBe(accessToken);
            expect(result.refresh.token).toBe(refreshToken);
        });

        test('should set correct expiration times', async () => {
            const user = { id: 'user123' };
            jwt.sign.mockReturnValue('token');
            
            const mockTokenDoc = {
                save: jest.fn().mockResolvedValue(true)
            };
            Token.mockImplementation(() => mockTokenDoc);

            const result = await tokenService.generateAuthTokens(user);

            expect(result.access.expires).toBeGreaterThan(Date.now());
            expect(result.refresh.expires).toBeGreaterThan(result.access.expires);
        });

        test('should save only refresh token to database', async () => {
            const user = { id: 'user123' };
            const refreshToken = 'refresh.token';

            jwt.sign
                .mockReturnValueOnce('access.token')
                .mockReturnValueOnce(refreshToken);

            const mockTokenDoc = {
                save: jest.fn().mockResolvedValue(true)
            };
            Token.mockImplementation(() => mockTokenDoc);

            await tokenService.generateAuthTokens(user);

            expect(Token).toHaveBeenCalledWith({
                token: refreshToken,
                userId: user.id,
                type: TokenType.REFRESH
            });
            expect(mockTokenDoc.save).toHaveBeenCalledTimes(1);
        });

        test('should generate access token with 15 minutes expiry', async () => {
            const user = { id: 'user123' };
            jwt.sign.mockReturnValue('token');
            
            const mockTokenDoc = {
                save: jest.fn().mockResolvedValue(true)
            };
            Token.mockImplementation(() => mockTokenDoc);

            await tokenService.generateAuthTokens(user);

            const accessTokenCall = jwt.sign.mock.calls[0];
            expect(accessTokenCall[0].type).toBe(TokenType.ACCESS);
            expect(accessTokenCall[0].exp - accessTokenCall[0].iat).toBe(15 * 60);
        });

        test('should generate refresh token with 7 days expiry', async () => {
            const user = { id: 'user123' };
            jwt.sign.mockReturnValue('token');
            
            const mockTokenDoc = {
                save: jest.fn().mockResolvedValue(true)
            };
            Token.mockImplementation(() => mockTokenDoc);

            await tokenService.generateAuthTokens(user);

            const refreshTokenCall = jwt.sign.mock.calls[1];
            expect(refreshTokenCall[0].type).toBe(TokenType.REFRESH);
            expect(refreshTokenCall[0].exp - refreshTokenCall[0].iat).toBe(7 * 24 * 60 * 60);
        });
    });
});
