require('dotenv').config();
const db = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 3000;

db.connect();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
