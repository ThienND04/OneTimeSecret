const User = require('../models/User');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status');

/**
 * Creates a new user in the database
 * @param {Object} userData - User data for creation
 * @param {string} userData.userName - Username
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password (will be hashed)
 * @param {string} userData.gender - User gender
 * @returns {Promise<Object>} Created user document
 * @throws {ApiError} 400 if email already exists
 */
const createUser = async (userData) => {
    if (await User.isEmailExist(userData.email)) {
        throw new ApiError(httpStatus.default.BAD_REQUEST, 'Email already in use');
    }
    return User.create(userData);
}

/**
 * Retrieves a user by their ID
 * @param {string} id - MongoDB ObjectId of the user
 * @returns {Promise<Object|null>} User document or null if not found
 */
const getUserById = async (id) => {
    return User.findById(id);
}

module.exports = { createUser, getUserById }; 
