const Token = require('../models/Token');
const jwt = require('jsonwebtoken');
const {TokenType} = require('../config/tokens');
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');

/**
 * Generates a JWT token with the specified parameters
 * @param {string} userId - User ID to encode in token
 * @param {number} expires - Token expiration time in seconds
 * @param {string} type - Token type (access, refresh, etc.)
 * @param {string} [secret] - Secret key for signing (defaults to config.jwt.secret)
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expires,
        type: type,
        jwti: uuidv4(),
    };
    return jwt.sign(payload, secret);
}

/**
 * Saves a token to the database
 * @param {string} token - JWT token string
 * @param {string} userId - User ID associated with the token
 * @param {string} type - Token type (access, refresh, etc.)
 * @returns {Promise<Object>} Saved token document
 */
const saveToken = async (token, userId, type) => {
    const tokenDoc = new Token({
        token,
        userId,
        type
    });
    await tokenDoc.save();
    return tokenDoc;
}

/**
 * Verifies a JWT token and retrieves it from database
 * @param {string} token - JWT token to verify
 * @param {string} type - Expected token type
 * @returns {Promise<Object>} Token document from database
 * @throws {Error} If token is invalid or not found in database
 */
const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await Token.findOne({ token, userId: payload.sub, type });
    if (!tokenDoc) {
        throw new Error('Token not found');
    }
    return tokenDoc;
}

/**
 * Generates access and refresh tokens for a user
 * @param {Object} user - User object with id property
 * @param {string} user.id - User ID
 * @returns {Promise<Object>} Object containing access and refresh token details
 * @returns {Object} returns.access - Access token info with token and expires
 * @returns {Object} returns.refresh - Refresh token info with token and expires
 */
const generateAuthTokens = async (user) => {
    const accessToken = generateToken(user.id, 15 * 60, TokenType.ACCESS);
    const refreshToken = generateToken(user.id, 7 * 24 * 60 * 60, TokenType.REFRESH);
    await saveToken(refreshToken, user.id, TokenType.REFRESH);
    return {
        access: {
            token: accessToken,
            expires: Date.now() + 15 * 60 * 1000
        },
        refresh: {
            token: refreshToken,
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000
        }
    };
}

/**
 * Generates a password reset token for a user
 * @param {string} email - User email address
 * @returns {Promise<string>} Reset token
 * @throws {Error} If user not found
 */
const generateResetPasswordToken = async (email) => {
    const User = require('../models/User');
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new Error('No user found with this email');
    }
    
    // Delete any existing reset tokens for this user
    await Token.deleteMany({ userId: user.id, type: TokenType.RESET_PASSWORD });
    
    // Generate new reset token (expires in 10 minutes)
    const resetToken = generateToken(user.id, 10 * 60, TokenType.RESET_PASSWORD);
    await saveToken(resetToken, user.id, TokenType.RESET_PASSWORD);
    
    return resetToken;
}

module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
    generateResetPasswordToken
};