const Secret = require('../models/Secret');
const cloudinary = require('../config/cloudinary');

async function cleanupOldSecrets() {
    console.log('Starting cleanup of old secrets...');
    const threshold = new Date(Date.now() - 30 * 1000); // delete secrets files older than 30 minutes
    const secrets = await Secret.find({ read: true, readAt: { $lt: threshold } });

    for (const secret of secrets) {
        for (const file of secret.files) {
            try {
                await cloudinary.uploader.destroy(file.filename);
                console.log(`Deleted file: ${file.filename}`);
            } catch (err) {
                console.error(`Failed to delete file: ${file.filename}`, err);
            }
        }
        await secret.deleteOne();
        console.log(`Deleted secret ${secret._id}`);
    }
}

module.exports = cleanupOldSecrets;