const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
    },

    email:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
    },

    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },

    resetPasswordToken:{
        type: String,
        default: null,
    },

    resetPasswordExpires:{
        type: Date,
        default: null,
    }
}, {timestamps: true});

module.exports = mongoose.model('Users', userSchema);