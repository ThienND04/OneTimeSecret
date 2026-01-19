const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, 
    message: {
        status: 429,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false 
});

module.exports = rateLimiter;