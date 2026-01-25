const config = require('./config/config');
require('./cron/cleanupJob');
const db = require('./config/db');
const app = require('./app');

const PORT = config.port;

db.connect();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
