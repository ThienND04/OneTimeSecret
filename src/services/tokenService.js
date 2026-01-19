const Token = require('../models/Token');
const jwt = require('jsonwebtoken');
const {TokenType} = require('../config/tokens');

const generateToken = (userId, exprires, type, secret = process.env.SECRET_KEY) => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + exprires,
        type: type
    };
    return jwt.sign(payload, secret);
}

const saveToken = async (token, userId, type) => {
    const tokenDoc = new Token({
        token,
        userId,
        type
    });
    await tokenDoc.save();
    return tokenDoc;
}

const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    const tokenDoc = await Token.findOne({ token, userId: payload.sub, type });
    if (!tokenDoc) {
        throw new Error('Token not found');
    }
    return tokenDoc;
}

const generateAuthTokens = async (user) => {
    const accessToken = generateToken(user.id, 15 * 60, TokenType.ACCESS);
    const refreshToken = generateToken(user.id, 7 * 24 * 60 * 60, TokenType.REFRESH);
    await saveToken(refreshToken, user.id, TokenType.REFRESH);
    return {
        access: {
            token: accessToken,
            expires: Date.now() + 15 * 60 * 1000
        },
        refresh: {
            token: refreshToken,
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000
        }
    };
}

module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens
};