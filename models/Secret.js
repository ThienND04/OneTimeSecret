const mongoose = require('mongoose');

const secretSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Secret', secretSchema);
