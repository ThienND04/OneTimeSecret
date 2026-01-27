/**
 * Express error handling middleware for file upload and general errors
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
    console.error('Error occurred:', err);
    
    // Handle file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size should not exceed 3MB.' });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'You can only upload up to 3 files.' });
    }
    
    // Handle ApiError
    if (err.isOperational) {
        return res.status(err.statusCode || 500).json({ 
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
    
    // Handle other errors
    return res.status(500).json({
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = errorHandler;
