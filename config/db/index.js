const mongoose = require('mongoose');

async function connect() {
    console.log('Connecting to database...');
    console.log('Mongo URI:', process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: 'admin'
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

module.exports = { connect };
