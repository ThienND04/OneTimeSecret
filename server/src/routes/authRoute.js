const express = require('express');
const authController = require('../controllers/AuthController');
const authValidator = require('../validators/authValidator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post(
    '/register',
    validate(authValidator.registerSchema),
    authController.register
);
router.post(
    '/login',
    validate(authValidator.loginSchema),
    authController.login
);
router.post(
    '/logout',
    validate(authValidator.logoutSchema),
    authController.logout
);
router.post(
    '/refresh-tokens',
    validate(authValidator.refreshTokenSchema),
    authController.refreshToken
);
router.post(
    '/forgot-password',
    validate(authValidator.forgotPasswordSchema),
    authController.forgotPassword
);
router.post(
    '/reset-password',
    validate(authValidator.resetPasswordSchema),
    authController.resetPassword
);
router.post(
    '/change-password',
    authenticate,
    validate(authValidator.changePasswordSchema),
    authController.changePassword
);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *               - gender
 *             properties:
 *               userName:
 *                 type: string
 *                 minLength: 3
 *                 description: Username (minimum 3 characters)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Must be a valid and unique email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 25
 *                 description: Password (6-25 characters)
 *               gender:
 *                 type: string
 *                 enum: [male, female, helicopter]
 *                 description: User gender
 *             example:
 *               userName: johndoe
 *               email: john@example.com
 *               password: password123
 *               gender: male
 *     responses:
 *       "201":
 *         description: User created successfully
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly cookie containing refresh token
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       $ref: '#/components/schemas/Token'
 *       "400":
 *         description: Validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: john@example.com
 *               password: password123
 *     responses:
 *       "200":
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly cookie containing refresh token
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       $ref: '#/components/schemas/Token'
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout (invalidate refresh token)
 *     tags: [Auth]
 *     description: Invalidates the refresh token stored in httpOnly cookie
 *     responses:
 *       "204":
 *         description: Logout successful (no content)
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh authentication tokens
 *     tags: [Auth]
 *     description: Uses refresh token from httpOnly cookie to generate new access token
 *     responses:
 *       "200":
 *         description: New tokens generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       $ref: '#/components/schemas/Token'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     description: Sends password reset email to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: john@example.com
 *     responses:
 *       "204":
 *         description: Password reset email sent (if email exists)
 *       "400":
 *         description: Invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     description: Resets password using token from email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token from email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 25
 *                 description: New password (6-25 characters)
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               password: newPassword123
 *     responses:
 *       "204":
 *         description: Password reset successful
 *       "401":
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 25
 *                 description: New password (6-25 characters)
 *             example:
 *               currentPassword: oldPassword123
 *               newPassword: newPassword456
 *     responses:
 *       "204":
 *         description: Password changed successfully
 *       "401":
 *         description: Unauthorized or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

module.exports = router;
