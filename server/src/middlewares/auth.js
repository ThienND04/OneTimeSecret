const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status');
const config = require('../config/config');

/**
 * Authentication middleware - Requires valid JWT token
 * Verifies token and attaches user to request object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @throws {ApiError} 401 if token is missing, invalid, or expired
 */
const authenticate = async (req, res, next) => {
    try {
        let token = null;

        // Try to get token from cookie
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        // Fallback to Authorization header
        else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.replace('Bearer ', '');
        }

        if (!token) {
            throw new ApiError(
                httpStatus.default.UNAUTHORIZED,
                'Authentication required'
            );
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.sub);

        if (!user) {
            throw new ApiError(
                httpStatus.default.UNAUTHORIZED,
                'User not found'
            );
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(
                new ApiError(httpStatus.default.UNAUTHORIZED, 'Invalid token')
            );
        } else if (error.name === 'TokenExpiredError') {
            next(
                new ApiError(httpStatus.default.UNAUTHORIZED, 'Token expired')
            );
        } else {
            next(error);
        }
    }
};

/**
 * Optional authentication middleware - Does not require token
 * If valid token is provided, attaches user to request object
 * If no token or invalid token, continues without user
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token = null;

        // Try to get token from cookie
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        // Fallback to Authorization header
        else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.replace('Bearer ', '');
        }

        if (token) {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findById(decoded.sub);

            if (user) {
                req.user = user;
                req.userId = user._id;
            }
        }
        next();
    } catch (error) {
        // continue without user
        next();
    }
};

module.exports = { authenticate, optionalAuth };
