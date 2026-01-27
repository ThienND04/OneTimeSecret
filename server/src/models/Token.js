const mongoose = require('mongoose');
const {TokenType} = require('../config/tokens');
const { token } = require('morgan');

const tokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: [TokenType.ACCESS, TokenType.REFRESH, TokenType.RESET_PASSWORD, TokenType.VERIFY_EMAIL],
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;