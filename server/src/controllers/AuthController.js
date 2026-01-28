const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const tokenService = require('../services/tokenService');
const authService = require('../services/authService');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const ApiError = require('../utils/apiError');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @param {import('express').Request} req - Express request with user data in body
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} Returns created user and auth tokens
 */
const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);

    // Set refresh token as httpOnly cookie
    const config = require('../config/config');
    res.cookie('refreshToken', tokens.refresh.token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge
    });

    // Only send access token and user in response body
    res.status(httpStatus.default.CREATED).send({
        user,
        tokens: {
            access: tokens.access
        }
    });
});

/**
 * Login user with email and password
 * @route POST /api/auth/login
 * @access Public
 * @param {import('express').Request} req - Express request with email and password in body
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} Returns user and auth tokens
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    const tokens = await tokenService.generateAuthTokens(user);

    // Set refresh token as httpOnly cookie
    const config = require('../config/config');
    res.cookie('refreshToken', tokens.refresh.token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge
    });

    // Only send access token and user in response body
    res.status(httpStatus.default.OK).send({
        user,
        tokens: {
            access: tokens.access
        }
    });
});

/**
 * Logout user by invalidating refresh token
 * @route POST /api/auth/logout
 * @access Public
 * @param {import('express').Request} req - Express request with refreshToken in body
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} Returns success message
 */
const logout = catchAsync(async (req, res) => {
    // Get refresh token from cookie instead of body
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await authService.logoutUser(refreshToken);
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');
    res.status(httpStatus.default.OK).json({ message: 'Logout successful' });
});

/**
 * Refresh authentication tokens
 * @route POST /api/auth/refresh-tokens
 * @access Public
 * @param {import('express').Request} req - Express request with refreshToken in body
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} Returns new auth tokens
 */
const refreshToken = catchAsync(async (req, res) => {
    // Get refresh token from cookie instead of body
    const refreshTokenValue = req.cookies.refreshToken;
    if (!refreshTokenValue) {
        throw new ApiError(
            httpStatus.default.UNAUTHORIZED,
            'Refresh token not found'
        );
    }

    const tokens = await authService.refreshAuth(refreshTokenValue);
    const decoded = jwt.verify(tokens.access.token, config.jwt.secret);
    const user = await userService.getUserById(decoded.sub);

    // Update refresh token cookie with new token
    res.cookie('refreshToken', tokens.refresh.token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge
    });

    // Send access token and user info in response body
    res.status(200).json({
        user,
        tokens: {
            access: tokens.access
        },
        message: 'Token refreshed successfully'
    });
});

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 * @param {import('express').Request} req - Express request with email in body
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} Returns 204 No Content
 */
const forgotPassword = catchAsync(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    res.status(httpStatus.default.NO_CONTENT).send();
});

/**
 * Reset password using token
 * @route POST /api/auth/reset-password
 * @access Public
 * @param {import('express').Request} req - Express request with token and password in body
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} Returns 204 No Content
 */
const resetPassword = catchAsync(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(httpStatus.default.NO_CONTENT).send();
});

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword
};
