const express = require('express');
const authController = require('../controllers/AuthController');
const { registerSchema} = require('../validators/authValidator');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;