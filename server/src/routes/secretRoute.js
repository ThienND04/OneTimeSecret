const express = require('express');
const router = express.Router();
const secretController = require('../controllers/SecretController');
const upload = require('../middlewares/upload');
const limitFileCount = require('../middlewares/limitFileCount');
const validate = require('../middlewares/validate');
const secretValidator = require('../validators/secretValidator');
const { authenticate, optionalAuth } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Secrets
 *   description: Secret management and retrieval endpoints
 */

/**
 * @swagger
 * /secrets:
 *   post:
 *     summary: Create a new secret
 *     tags: [Secrets]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     description: Creates a new one-time secret with optional file attachments. Can be used with or without authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - expiresInMinutes
 *             properties:
 *               content:
 *                 type: string
 *                 description: Secret content (text)
 *               expiresInMinutes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10080
 *                 description: Expiration time in minutes (max 7 days = 10080 minutes)
 *               passphrase:
 *                 type: string
 *                 minLength: 4
 *                 description: Optional passphrase to protect the secret
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 3
 *                 description: Optional file attachments (max 3 files)
 *             example:
 *               content: This is my secret message
 *               expiresInMinutes: 60
 *               passphrase: my-secure-pass
 *     responses:
 *       "201":
 *         description: Secret created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secretId:
 *                   type: string
 *                   description: Unique ID to access the secret
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Expiration timestamp
 *       "400":
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /secrets/search/{id}:
 *   post:
 *     summary: Retrieve a secret by ID
 *     tags: [Secrets]
 *     description: Retrieves and decrypts a one-time secret. The secret will be deleted after retrieval.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Secret ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passphrase:
 *                 type: string
 *                 description: Passphrase if secret is protected
 *             example:
 *               passphrase: my-secure-pass
 *     responses:
 *       "200":
 *         description: Secret retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: Decrypted secret content
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       fileName:
 *                         type: string
 *                   description: Array of file URLs if secret had attachments
 *       "404":
 *         description: Secret not found or already consumed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: Invalid or missing passphrase
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /secrets/me/secrets:
 *   get:
 *     summary: Get user's secrets with pagination
 *     tags: [Secrets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       "200":
 *         description: List of user's secrets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       hasPassphrase:
 *                         type: boolean
 *                       isConsumed:
 *                         type: boolean
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /secrets/me/stats:
 *   get:
 *     summary: Get user's secret statistics
 *     tags: [Secrets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSecrets:
 *                   type: integer
 *                   description: Total number of secrets created
 *                 activeSecrets:
 *                   type: integer
 *                   description: Number of active (not consumed/expired) secrets
 *                 consumedSecrets:
 *                   type: integer
 *                   description: Number of consumed secrets
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /secrets/me/secrets/{id}:
 *   get:
 *     summary: Get detailed information about a specific secret
 *     tags: [Secrets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Secret ID
 *     responses:
 *       "200":
 *         description: Secret details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 hasPassphrase:
 *                   type: boolean
 *                 isConsumed:
 *                   type: boolean
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileName:
 *                         type: string
 *       "404":
 *         description: Secret not found or not owned by user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     summary: Revoke (delete) a secret
 *     tags: [Secrets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Secret ID
 *     responses:
 *       "200":
 *         description: Secret revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Secret revoked successfully
 *       "404":
 *         description: Secret not found or not owned by user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

router.post(
    '/',
    optionalAuth,
    upload.array('files', 3),
    validate(secretValidator.createSecretSchema),
    secretController.createSecret
);
router.post(
    '/search/:id',
    validate(secretValidator.getSecretSchema),
    secretController.getSecretById
);

// Authenticated routes - Secret management for logged-in users
router.get(
    '/me/secrets',
    authenticate,
    validate(secretValidator.getUserSecretsSchema),
    secretController.getUserSecrets
);
router.get('/me/stats', authenticate, secretController.getUserStats);
router.get(
    '/me/secrets/:id',
    authenticate,
    validate(secretValidator.getSecretDetailsSchema),
    secretController.getSecretDetails
);
router.delete(
    '/me/secrets/:id',
    authenticate,
    validate(secretValidator.revokeSecretSchema),
    secretController.revokeSecret
);

module.exports = router;
