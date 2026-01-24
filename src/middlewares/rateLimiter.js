const rateLimit = require('express-rate-limit');
const config = require('../config/config');

/**
 * Rate limiter middleware to prevent abuse and DDoS attacks
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const rateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        status: 429,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false 
});

module.exports = rateLimiter;