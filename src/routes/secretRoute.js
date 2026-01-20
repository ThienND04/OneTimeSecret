const express = require('express');
const router = express.Router();
const secretController = require('../controllers/SecretController');
const upload = require('../middlewares/upload');
const limitFileCount = require('../middlewares/limitFileCount');
const validate = require('../middlewares/validate');
const secretValidator = require('../validators/secretValidator');

// upload.array() must come BEFORE validate() for multipart/form-data
router.post('/', upload.array('files', 3), validate(secretValidator.createSecretSchema), secretController.createSecret);
router.get('/:id', validate(secretValidator.getSecretSchema), secretController.getSecretById);

module.exports = router;