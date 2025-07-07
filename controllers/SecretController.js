const { v4: uuidv4 } = require('uuid');
const Secret = require('../models/Secret');
const bcrypt = require('bcrypt');
const {encryptText, decryptText} = require('../utils/encryption'); 
const {createSecretSchema, getSecretSchema} = require('../validators/secretValidator');

class SecretController {
    // [POST] /api/secret
    async createSecret(req, res) {
        try {
            console.log('Creating a new secret');
            const parsedBody = createSecretSchema.safeParse(req.body || {});
            if (!parsedBody.success) {
                console.error('Validation error:', parsedBody.error);
                return res.status(400).json({
                    message: 'Invalid request data',
                    errors: parsedBody.error.errors.map(err => err.message)
                });
            }

            const { content, password, is_client_encrypted } = parsedBody.data;
            if (!content)
                return res.status(400).json({ message: 'Content is required' });

            const {encryptedContent, iv} = encryptText(content);

            const id = uuidv4();

            let password_hash = null;
            if (password) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 8;
                password_hash = await bcrypt.hash(password, saltRounds);
            }

            const secret = new Secret({ 
                id, 
                encrypted_content: encryptedContent,
                iv, 
                is_client_encrypted,
                password_hash 
            });

            await secret.save();

            res.status(201).json({
                message: 'Secret created',
                accessUrl: `${req.protocol}://${req.get('host')}/api/secret/${id}`
            });
        } catch (error) {
            console.error('Error creating secret:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // [GET] /api/secret/:id
    async getSecretById(req, res) {
        try {
            const { id } = req.params;

            const parsedBody = getSecretSchema.safeParse(req.body || {});
            if (!parsedBody.success) {
                console.error('Validation error:', parsedBody.error);
                return res.status(400).json({
                    message: 'Invalid request data',
                    errors: parsedBody.error.errors.map(err => err.message)
                });
            }
            const { password } = parsedBody.data || {};

            const secret = await Secret.findOne({ id });
            if (!secret)
                return res
                    .status(404)
                    .json({ message: 'Secret not found or already viewed' });

            if (secret.read)
                return res
                    .status(410)
                    .json({ message: 'Secret already viewed and destroyed' });

            if (secret.password_hash) {
                if (!password) {
                    return res.status(401).json({ message: 'Password is required to access this secret' });
                }
                const match = await bcrypt.compare(password, secret.password_hash);
                if (!match) {
                    return res.status(403).json({ message: 'Incorrect password' });
                }
            }

            secret.read = true;
            secret.readAt = new Date();
            await secret.save();

            res.status(200).json({ 
                content: decryptText(secret.encrypted_content, secret.iv), 
                is_client_encrypted: secret.is_client_encrypted 
            });
        }
        catch(error) {
            console.error('Error retrieving secret:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } 
}

module.exports = new SecretController();
