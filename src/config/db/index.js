const mongoose = require('mongoose');
const config = require('../config');

async function connect() {
    console.log('Connecting to database...');
    console.log('Mongo URI:', config.mongoose.url);
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

module.exports = { connect };
