/**
 * Higher-order function that wraps async route handlers to catch errors
 * Automatically forwards errors to Express error handling middleware
 * @param {Function} fn - Async function to wrap (req, res, next) => Promise<void>
 * @returns {import('express').RequestHandler} Express middleware with error handling
 * @example
 * const getUser = catchAsync(async (req, res) => {
 *   const user = await User.findById(req.params.id);
 *   res.json(user);
 * });
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;