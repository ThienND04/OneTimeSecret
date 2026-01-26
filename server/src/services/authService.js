const User = require('../models/User');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status');
const tokenService = require('./tokenService');
const Token = require('../models/Token');
const { TokenType } = require('../config/tokens');
const userService = require('./userService');

/**
 * Authenticates a user with email and password
 * @param {string} email - User email address
 * @param {string} password - User password
 * @returns {Promise<Object>} Authenticated user document
 * @throws {ApiError} 401 if credentials are invalid
 */
const loginUser = async (email, password) => {
    const user = await User.findOne({email: email.toLowerCase()});

    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.default.UNAUTHORIZED, 'Incorrect email or password');
    }
    return user;
}

/**
 * Logs out a user by invalidating their refresh token
 * @param {string} refreshToken - Refresh token to invalidate
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if refresh token not found
 */
const logoutUser = async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: TokenType.REFRESH});
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.default.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.deleteOne();
}

/**
 * Refreshes authentication tokens using a valid refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {Promise<Object>} New access and refresh tokens
 * @throws {ApiError} 401 if refresh token is invalid or user not found
 */
const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
        const user = await userService.getUserById(refreshTokenDoc.userId);
        if (!user) {
            throw new Error();
        }
        await refreshTokenDoc.deleteOne();
        return tokenService.generateAuthTokens(user);
    } catch (error) {
        throw new ApiError(httpStatus.default.UNAUTHORIZED, 'Please authenticate');
    }
}

/**
 * Initiates password reset by sending reset token via email
 * @param {string} email - User email address
 * @returns {Promise<void>}
 * Note: Returns success even if email not found (prevents email enumeration)
 */
const forgotPassword = async (email) => {
    try {
        const resetToken = await tokenService.generateResetPasswordToken(email);
        const emailService = require('./emailService');
        await emailService.sendResetPasswordEmail(email, resetToken);
    } catch (error) {
        // Silently fail if user not found (security: prevent email enumeration)
        // Log error for debugging but don't throw
        console.log('Password reset requested for non-existent email:', email);
    }
}

/**
 * Resets user password using valid reset token
 * @param {string} resetToken - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 * @throws {ApiError} 401 if token invalid or expired
 */
const resetPassword = async (resetToken, newPassword) => {
    try {
        const resetTokenDoc = await tokenService.verifyToken(resetToken, TokenType.RESET_PASSWORD);
        const user = await userService.getUserById(resetTokenDoc.userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        // Update user password
        user.password = newPassword;
        await user.save();
        
        // Delete all tokens for this user (logout from all devices)
        await Token.deleteMany({ userId: user.id });
    } catch (error) {
        throw new ApiError(httpStatus.default.UNAUTHORIZED, 'Password reset failed. Token is invalid or expired');
    }
}

module.exports = {
    loginUser, 
    logoutUser,
    refreshAuth,
    forgotPassword,
    resetPassword
};