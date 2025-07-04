const express = require('express');
const router = express.Router();
const secretController = require('../controllers/SecretController');

router.post('/', secretController.createSecret);
router.get('/:id', secretController.getSecretById);

module.exports = router;
