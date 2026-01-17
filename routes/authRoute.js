const express = require('express');
const authController = require('../controllers/AuthController');
const authValidator = require('../validators/authValidator');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post('/register', validate(authValidator.registerSchema), authController.register);
router.post('/login', validate(authValidator.loginSchema), authController.login);
router.post('/logout', validate(authValidator.logoutSchema), authController.logout);
router.post('/refresh-tokens', validate(authValidator.refreshTokenSchema), authController.refreshToken);

module.exports = router;