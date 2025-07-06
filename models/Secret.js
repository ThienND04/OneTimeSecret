const mongoose = require('mongoose');

const secretSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    content: { type: String, required: true },
    password_hash: { type: String, default: null },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    readAt: { type: Date, default: null, index: {expires: 900} },
});

module.exports = mongoose.model('Secret', secretSchema);
