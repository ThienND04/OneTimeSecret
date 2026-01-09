const User = require('../models/User');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status');

const createUser = async (userData) => {
    if (await User.isEmailExist(userData.email)) {
        throw new ApiError(httpStatus.default.BAD_REQUEST, 'Email already in use');
    }
    return User.create(userData);
}

module.exports = { createUser }; 
