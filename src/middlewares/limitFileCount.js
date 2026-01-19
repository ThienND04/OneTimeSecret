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