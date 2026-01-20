const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const tokenService = require('../services/tokenService');
const authService = require('../services/authService');

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
    res.status(httpStatus.default.CREATED).send({ user, tokens });
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
    const {email, password} =  req.body;
    const user = await authService.loginUser(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.default.OK).send({ user, tokens });
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
    await authService.logoutUser(req.body.refreshToken);
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
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.status(200).json({ tokens, message: 'Token refreshed successfully' });
}); 

module.exports = {register, login, logout, refreshToken};