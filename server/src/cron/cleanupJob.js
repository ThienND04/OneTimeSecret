const cron = require('node-cron');
const cleanupOldSecrets = require('../services/secretCleanupService');

/**
 * Cron job that runs every minute to cleanup old read secrets
 * Removes secrets and their associated files from Cloudinary
 * Schedule: Every minute (* * * * *)
 */
cron.schedule('* * * * *', async () => {
    console.log('Running cleanup job...');
    await cleanupOldSecrets();
});
