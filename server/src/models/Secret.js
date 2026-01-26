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
    // New fields for authenticated users
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,  // null = anonymous secret
        index: true
    },
    title: {
        type: String,
        maxlength: 100,
        default: null,  // Optional user-provided title (private, not shown to recipient)
    },
    viewHistory: [{
        viewedAt: { type: Date, required: true },
        ipAddress: { type: String },
        userAgent: { type: String }
    }],
    isRevoked: {
        type: Boolean,
        default: false
    },
    revokedAt: {
        type: Date,
        default: null
    }
});

// Indexes for efficient queries
secretSchema.index({ userId: 1, createdAt: -1 });
secretSchema.index({ userId: 1, read: 1 });
secretSchema.index({ userId: 1, isRevoked: 1 });

module.exports = mongoose.model('Secret', secretSchema);
