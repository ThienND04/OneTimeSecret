const httpStatus = require('http-status');
const { v4: uuidv4 } = require('uuid');
const Secret = require('../models/Secret');
const bcrypt = require('bcrypt');
const { encryptText, decryptText } = require('../utils/encryption');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const config = require('../config/config');

/**
 * @desc    Create a new secret
 * @route   POST /api/secret
 * @access  Public
 */
const createSecret = catchAsync(async (req, res) => {
    const { content, password, is_client_encrypted } = req.body;

    const { encryptedContent, iv } = encryptText(content);
    const id = uuidv4();

    const password_hash = password
        ? await bcrypt.hash(password, config.bcrypt.saltRounds)
        : null;

    const files = (req.files || []).map(file => ({
        url: file.path || '',
        originalName: file.originalname,
        mimeType: file.mimetype,
        filename: file.filename,
    }));

    const secret = new Secret({
        id,
        encrypted_content: encryptedContent,
        files,
        iv,
        is_client_encrypted,
        password_hash,
    });

    await secret.save();

    res.status(httpStatus.default.CREATED).json({
        message: 'Secret created',
        accessUrl: `${req.protocol}://${req.get('host')}/api/secret/${id}`,
    });
});

/**
 * @desc    Get secret by ID (one-time view)
 * @route   GET /api/secret/:id
 * @access  Public
 */
const getSecretById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    const secret = await Secret.findOne({ id });

    if (!secret) {
        throw new ApiError(httpStatus.default.NOT_FOUND, 'Secret not found or already viewed');
    }

    if (secret.read) {
        throw new ApiError(httpStatus.default.GONE, 'Secret already viewed and destroyed');
    }

    if (secret.password_hash) {
        if (!password) {
            throw new ApiError(httpStatus.default.UNAUTHORIZED, 'Password is required to access this secret');
        }
        const isPasswordValid = await bcrypt.compare(password, secret.password_hash);
        if (!isPasswordValid) {
            throw new ApiError(httpStatus.default.FORBIDDEN, 'Incorrect password');
        }
    }

    secret.read = true;
    secret.readAt = new Date();
    await secret.save();

    res.status(httpStatus.default.OK).json({
        content: decryptText(secret.encrypted_content, secret.iv),
        files: secret.files,
        is_client_encrypted: secret.is_client_encrypted,
    });
});

module.exports = { getSecretById, createSecret };
