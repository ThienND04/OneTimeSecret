const { v4: uuidv4 } = require('uuid');
const Secret = require('../models/Secret');
const bcrypt = require('bcrypt');

class SecretController {
    async createSecret(req, res) {
        try {
            console.log('Creating a new secret');
            const { content, password } = req.body || {};
            if (!content)
                return res.status(400).json({ message: 'Content is required' });

            const id = uuidv4();

            let password_hash = null;
            if (password) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 8;
                password_hash = await bcrypt.hash(password, saltRounds);
            }

            const secret = new Secret({ id, content, password_hash });
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

    async getSecretById(req, res) {
        const { id } = req.params;
        const { password } = req.body || {};

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
        await secret.save();

        res.status(200).json({ content: secret.content });
    }
}

module.exports = new SecretController();
