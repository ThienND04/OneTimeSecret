/**
 * Middleware factory that limits the number of uploaded files for a specific field
 * @param {string} fieldName - The name of the form field containing files
 * @param {number} maxCount - Maximum number of files allowed
 * @returns {import('express').RequestHandler} Express middleware function
 */
function limitFileCount(fieldName, maxCount) {
    return (req, res, next) => {
        const files = (req.files || []).filter(f => f.fieldname === fieldName);
        if (files.length > maxCount) {
            return res.status(400).json({
                error: `Too many files in '${fieldName}' field. Max allowed: ${maxCount}`,
            });
        }
        next();
    };
}

module.exports = limitFileCount;