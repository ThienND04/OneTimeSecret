const express = require('express');
const router = express.Router();
const secretController = require('../controllers/SecretController');
const upload = require('../middlewares/upload');
const limitFileCount = require('../middlewares/limitFileCount');

router.post('/', upload.array('files', 3), secretController.createSecret);
router.get('/:id', secretController.getSecretById);

module.exports = router;