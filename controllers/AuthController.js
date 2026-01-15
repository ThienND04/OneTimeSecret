const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const tokenService = require('../services/tokenService');
const { loginUser, logoutUser } = require('../services/authService');

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.default.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
    const {email, password} =  req.body;
    const user = await loginUser(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.default.OK).send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
    await logoutUser(req.body.refreshToken);
    res.status(httpStatus.default.OK).json({ message: 'Logout successful' });
});

const refreshToken = catchAsync(async (req, res) => {
    // Implement token refresh logic here
    res.status(200).json({ message: 'Token refreshed successfully' });
}); 

module.exports = {register, login, logout, refreshToken};