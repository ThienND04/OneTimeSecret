const express = require('express');
const router = express.Router();
const secretController = require('../controllers/SecretController');
const upload = require('../middlewares/upload');
const limitFileCount = require('../middlewares/limitFileCount');
const validate = require('../middlewares/validate');
const secretValidator = require('../validators/secretValidator');
const { authenticate, optionalAuth } = require('../middlewares/auth');

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
