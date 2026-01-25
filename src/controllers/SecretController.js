const httpStatus = require('http-status');
const { v4: uuidv4 } = require('uuid');
const Secret = require('../models/Secret');
const bcrypt = require('bcrypt');
const { encryptText, decryptText } = require('../utils/encryption');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const config = require('../config/config');
const secretService = require('../services/secretService');
const pick = require('../utils/pick');

/**
 * @desc    Create a new secret
 * @route   POST /api/secret
 * @access  Public (optionally authenticated)
 */
const createSecret = catchAsync(async (req, res) => {
    const { content, password, is_client_encrypted, title } = req.body;

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
        userId: req.userId || null,  // From optionalAuth middleware
        title: title || null
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

    // Record view in history
    const viewRecord = {
        viewedAt: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
    };
    
    secret.read = true;
    secret.readAt = new Date();
    secret.viewHistory.push(viewRecord);
    await secret.save();

    res.status(httpStatus.default.OK).json({
        content: decryptText(secret.encrypted_content, secret.iv),
        files: secret.files,
        is_client_encrypted: secret.is_client_encrypted,
    });
});

/**
 * @desc    Get user's secrets with pagination and filters
 * @route   GET /api/secret/me/secrets
 * @access  Private (authenticated users only)
 */
const getUserSecrets = catchAsync(async (req, res) => {
    const options = pick(req.query, ['page', 'limit', 'status', 'sortBy', 'search']);
    const result = await secretService.getUserSecrets(req.userId, options);

    res.status(httpStatus.default.OK).json({
        success: true,
        data: result.secrets,
        pagination: result.pagination
    });
});

/**
 * @desc    Get user's secret statistics
 * @route   GET /api/secret/me/stats
 * @access  Private (authenticated users only)
 */
const getUserStats = catchAsync(async (req, res) => {
    const stats = await secretService.getUserSecretStats(req.userId);

    res.status(httpStatus.default.OK).json({
        success: true,
        data: stats
    });
});

/**
 * @desc    Get secret details for owner
 * @route   GET /api/secret/me/secrets/:id
 * @access  Private (authenticated users only)
 */
const getSecretDetails = catchAsync(async (req, res) => {
    const { id } = req.params;
    const secret = await secretService.getSecretDetails(id, req.userId);

    res.status(httpStatus.default.OK).json({
        success: true,
        data: secret
    });
});

/**
 * @desc    Revoke an unviewed secret
 * @route   DELETE /api/secret/me/secrets/:id
 * @access  Private (authenticated users only)
 */
const revokeSecret = catchAsync(async (req, res) => {
    const { id } = req.params;
    await secretService.revokeSecret(id, req.userId);

    res.status(httpStatus.default.OK).json({
        success: true,
        message: 'Secret revoked successfully'
    });
});

module.exports = { 
    getSecretById, 
    createSecret,
    getUserSecrets,
    getUserStats,
    getSecretDetails,
    revokeSecret
};
