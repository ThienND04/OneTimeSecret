const mongoose = require('mongoose');
const { url, lowercase } = require('zod/v4');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    id: { 
        type: String, unique: true 
    },
    userName: { 
        type: String, 
        required: true,
        unique: true 
    },
    gender: {
        type: String, 
        enum: ['male', 'female', 'helicopter'], 
        default: 'helicopter'
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate:{
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
    },
    password: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

userSchema.statics.isEmailExist = async function(email) {
    const user = await this.findOne({ email: email.toLowerCase() });
    // console.log(`isEmailExist check for ${email}:`, !!user);
    return !!user;
}

userSchema.methods.isPasswordMatch = async function(password) {
    const user = this;
    return await bcrypt.compare(password, user.password);
}

userSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
