/**
 * Custom API Error class for handling operational errors
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Creates an API error instance
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {boolean} [isOperational=true] - Whether error is operational (expected) or programming error
     * @param {string} [stack=''] - Custom stack trace (auto-generated if not provided)
     */
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;