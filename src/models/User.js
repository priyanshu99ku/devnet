const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    photoUrl: {
        type: String,
        default: 'https://i.pravatar.cc/150'
    },
    about: {
        type: String,
        trim: true,
        default: 'No information provided.'
    },
    skills: {
        type: [String] // Array of strings
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User; 