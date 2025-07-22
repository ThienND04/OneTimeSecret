const mongoose = require('mongoose');
const { url } = require('zod/v4');

const secretSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    encrypted_content: { type: String, required: true },
    files: [
        {
            url: { type: String, required: true },
            originalName: { type: String, required: true },
            mimeType: { type: String, required: true },
            filename: { type: String, required: true }
        }
    ],
    iv: { type: String},
    is_client_encrypted: { type: Boolean, default: false },
    password_hash: { type: String, default: null },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    readAt: { type: Date, default: null}, 
});

module.exports = mongoose.model('Secret', secretSchema);
