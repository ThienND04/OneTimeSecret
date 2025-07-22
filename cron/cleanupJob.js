const cron = require('node-cron');
const cleanupOldSecrets = require('../services/secretCleanupService');

cron.schedule('* * * * *', async () => {
    console.log('Running cleanup job...');
    await cleanupOldSecrets();
});
