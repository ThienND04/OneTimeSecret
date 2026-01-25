const Secret = require('../models/Secret');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status');

/**
 * Get user's secrets with pagination and filters
 * @param {string} userId - identity of the user in MongoDB
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @param {string} [options.status] - Filter by status: 'viewed', 'unviewed', 'revoked', 'all'
 * @param {string} [options.sortBy='createdAt:desc'] - Sort field and order
 * @param {string} [options.search] - Search in title
 * @returns {Promise<Object>} Paginated secrets and metadata
 */
const getUserSecrets = async (userId, options = {}) => {
    const {
        page = 1,
        limit = 10,
        status = 'all',
        sortBy = 'createdAt:desc',
        search
    } = options;

    const query = { userId };

    // Apply status filters
    if (status === 'viewed') {
        query.read = true;
        query.isRevoked = false;
    } else if (status === 'unviewed') {
        query.read = false;
        query.isRevoked = false;
    } else if (status === 'revoked') {
        query.isRevoked = true;
    }

    // Search by title
    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    // Parse sort
    const [sortField, sortOrder] = sortBy.split(':');
    const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const secrets = await Secret.find(query)
        .select('-encrypted_content -password_hash -iv')  // Don't return sensitive data
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Secret.countDocuments(query);

    return {
        secrets,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get secret statistics for a user
 * @param {string} userId - id of the user
 * @returns {Promise<Object>} statistics about user's secrets
 */
const getUserSecretStats = async (userId) => {
    const [total, viewed, unviewed, revoked] = await Promise.all([
        Secret.countDocuments({ userId }),
        Secret.countDocuments({ userId, read: true, isRevoked: false }),
        Secret.countDocuments({ userId, read: false, isRevoked: false }),
        Secret.countDocuments({ userId, isRevoked: true })
    ]);

    return {
        total,
        viewed,
        unviewed,
        revoked
    };
};

/**
 * Revoke an unviewed secret
 * @param {string} secretId - Secret UUID
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<Object>} Revoked secret
 * @throws {ApiError} 404 if secret not found
 * @throws {ApiError} 403 if user doesn't own the secret
 * @throws {ApiError} 400 if secret already viewed or revoked
 */
const revokeSecret = async (secretId, userId) => {
    const secret = await Secret.findOne({ id: secretId });

    if (!secret) {
        throw new ApiError(httpStatus.default.NOT_FOUND, 'Secret not found');
    }

    // Check ownership
    if (!secret.userId || secret.userId.toString() !== userId.toString()) {
        throw new ApiError(httpStatus.default.FORBIDDEN, 'You can only revoke your own secrets');
    }

    // Check if already viewed
    if (secret.read) {
        throw new ApiError(httpStatus.default.BAD_REQUEST, 'Cannot revoke a secret that has been viewed');
    }

    // Check if already revoked
    if (secret.isRevoked) {
        throw new ApiError(httpStatus.default.BAD_REQUEST, 'Secret is already revoked');
    }

    // Revoke the secret
    secret.isRevoked = true;
    secret.revokedAt = new Date();
    await secret.save();

    // TODO: Delete associated Cloudinary files
    // if (secret.files && secret.files.length > 0) {
    //   await deleteCloudinaryFiles(secret.files);
    // }

    return secret;
};

/**
 * Get secret details for owner (without revealing content)
 * @param {string} secretId - Secret UUID
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<Object>} Secret metadata
 * @throws {ApiError} 404 if secret not found
 * @throws {ApiError} 403 if user doesn't own the secret
 */
const getSecretDetails = async (secretId, userId) => {
    const secret = await Secret.findOne({ id: secretId })
        .select('-encrypted_content -password_hash -iv')
        .lean();

    if (!secret) {
        throw new ApiError(httpStatus.default.NOT_FOUND, 'Secret not found');
    }

    // Check ownership
    if (!secret.userId || secret.userId.toString() !== userId.toString()) {
        throw new ApiError(httpStatus.default.FORBIDDEN, 'You can only view your own secrets');
    }

    return secret;
};

module.exports = {
    getUserSecrets,
    getUserSecretStats,
    revokeSecret,
    getSecretDetails
};
