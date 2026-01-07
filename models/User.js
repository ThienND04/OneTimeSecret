const mongoose = require('mongoose');
const { url } = require('zod/v4');

const userSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    userName: { type: String, required: true, unique: true },
    gender: {type: String, enum: ['male', 'female', 'helicopter'], default: 'helicopter'},
    email: { type: String, required: true },
    encryptedPassword: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
