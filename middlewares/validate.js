const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    var value;
    try {
        value = Object.keys(validSchema).reduce((acc, key) => {
            acc[key] = validSchema[key].parse(object[key]);
            return acc;
        }, {});
        // console.log('Validation successful, parsed value:', value);
    } catch (error) {
        const errorMessage = error.errors.map((err) => err.message).join(', ');
        return next(new ApiError(httpStatus.default.BAD_REQUEST, `Validation error: ${errorMessage}`));
    }
    Object.assign(req, value);
    return next();
}

module.exports = validate;