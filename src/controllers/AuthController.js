const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const tokenService = require('../services/tokenService');
const authService = require('../services/authService');

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.default.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
    const {email, password} =  req.body;
    const user = await authService.loginUser(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.default.OK).send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
    await authService.logoutUser(req.body.refreshToken);
    res.status(httpStatus.default.OK).json({ message: 'Logout successful' });
});

const refreshToken = catchAsync(async (req, res) => {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.status(200).json({ tokens, message: 'Token refreshed successfully' });
}); 

module.exports = {register, login, logout, refreshToken};