const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/apiError');
const z = require('zod');

/**
 * Middleware factory that validates request data against a Zod schema
 * @param {Object} schema - Zod validation schema with optional params, query, body properties
 * @param {import('zod').ZodObject} [schema.params] - Schema for URL parameters
 * @param {import('zod').ZodObject} [schema.query] - Schema for query string
 * @param {import('zod').ZodObject} [schema.body] - Schema for request body
 * @returns {import('express').RequestHandler} Express middleware function
 * @throws {ApiError} Throws 400 Bad Request if validation fails
 */
const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    var value;
    try {
        value = Object.keys(validSchema).reduce((acc, key) => {
            acc[key] = validSchema[key].parse(object[key] === undefined ? {} : object[key]);
            return acc;
        }, {});
    } catch (error) {
        const errorMessage = error.errors.map((err) => err.message).join(', ');
        return next(new ApiError(httpStatus.default.BAD_REQUEST, `Validation error: ${errorMessage}`));
    }
    
    Object.keys(value).forEach((key) => {
        req[key] = value[key];
    });
    
    return next();
}

module.exports = validate;