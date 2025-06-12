const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable or fallback

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
        minlength: 8, // Minimum password length
        validate: {
            validator: function(v) {
                // Regular expression to check for at least one uppercase letter, one lowercase letter, one number, and one special character
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(v);
            },
            message: props => `${props.value} is not a strong password! It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.`
        }
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
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    sentRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest'
    }],
    receivedRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest'
    }]
}, {
    timestamps: true
});

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate a JWT token
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ id: this._id, email: this.email }, JWT_SECRET, { expiresIn: '1h' });
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 