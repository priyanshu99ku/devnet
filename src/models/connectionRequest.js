const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'ignored'],
        default: 'pending',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Add a compound index for efficient querying of connection requests
connectionRequestSchema.index({ sender: 1, recipient: 1, status: 1 });

// Pre-save hook to prevent sending connection request to self
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    // Check if the sender is the same as the recipient
    if (connectionRequest.sender.equals(connectionRequest.recipient)) {
        const error = new Error("Cannot send connection request to yourself!");
        return next(error);
    }
    next();
});

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest;
