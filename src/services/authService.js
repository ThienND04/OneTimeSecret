const User = require('../models/User');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status');
const tokenService = require('./tokenService');
const Token = require('../models/Token');
const { TokenType } = require('../config/tokens');
const userService = require('./userService');

const loginUser  = async (email, password) => {
    const user = await User.findOne({email: email.toLowerCase()});

    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    return user;
}

const logoutUser = async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: TokenType.REFRESH});
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.deleteOne();
}

const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
        console.log('Token Doc: ', refreshTokenDoc);
        const user = await userService.getUserById(refreshTokenDoc.userId);
        if (!user) {
            throw new Error();
        }
        await refreshTokenDoc.deleteOne();
        return tokenService.generateAuthTokens(user);
    } catch (error) {
        throw new ApiError(httpStatus.default.UNAUTHORIZED, 'Please authenticate');
    }
}

module.exports = {
    loginUser, 
    logoutUser,
    refreshAuth
};