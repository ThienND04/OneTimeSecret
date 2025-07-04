const { v4: uuidv4 } = require('uuid');
const Secret = require('../models/Secret');

class SecretController {
    async createSecret(req, res) {
        console.log('Creating a new secret');
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ message: 'Content is required' });

        const id = uuidv4();

        const secret = new Secret({ id, content });
        await secret.save();

        res.status(201).json({
            message: 'Secret created',
            accessUrl: `${req.protocol}://${req.get('host')}/api/secret/${id}`
        });
    }

    async getSecretById(req, res) {
        const { id } = req.params;

        const secret = await Secret.findOne({ id });
        if (!secret)
            return res
                .status(404)
                .json({ message: 'Secret not found or already viewed' });

        if (secret.read)
            return res
                .status(410)
                .json({ message: 'Secret already viewed and destroyed' });

        secret.read = true;
        await secret.save();

        res.status(200).json({ content: secret.content });
    }
}

module.exports = new SecretController();
