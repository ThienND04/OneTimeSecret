function errorHandler(err, req, res, next) {
    console.error('Error occurred:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size should not exceed 3MB.' });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'You can only upload up to 3 files.' });
    }
    next(err);
}

module.exports = errorHandler;
