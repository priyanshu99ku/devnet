const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ConnectionRequest = require('../models/connectionRequest');
const auth = require('../middleware/auth');

// POST /sendInterestedUser - Send connection request
router.post("/sendInterestedUser", auth, async (req, res) => {
  const { interestedUserId } = req.body;
  const senderId = req.user.id;

  if (!interestedUserId) {
    return res.status(400).json({ msg: 'Interested user ID is required' });
  }

  try {
    const recipient = await User.findById(interestedUserId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) {
      return res.status(404).json({ msg: 'Sender or Recipient user not found' });
    }

    if (senderId === interestedUserId) {
      return res.status(400).json({ msg: 'Cannot send connection request to yourself' });
    }

    // Check if a pending request already exists
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, recipient: interestedUserId, status: 'pending' },
        { sender: interestedUserId, recipient: senderId, status: 'pending' }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'Connection request already pending' });
    }

    // Check if users are already connected
    if (sender.connections.includes(interestedUserId)) {
      return res.status(400).json({ msg: 'Already connected with this user' });
    }

    // Create a new connection request
    const newRequest = new ConnectionRequest({
      sender: senderId,
      recipient: interestedUserId
    });

    await newRequest.save();

    // Update sender's sentRequests and recipient's receivedRequests
    sender.sentRequests.push(newRequest._id);
    recipient.receivedRequests.push(newRequest._id);
    await sender.save();
    await recipient.save();

    console.log(`Connection request sent from user ${senderId} to user ${interestedUserId}`);
    res.json({ success: true, message: 'Connection request sent successfully!', requestId: newRequest._id });

  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    res.status(500).send('Server Error');
  }
});

// POST /review/accepted/:requestId - Accept a received request
router.post("/review/accepted/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const recipientId = req.user.id; // The authenticated user (recipient who is accepting)

    const request = await ConnectionRequest.findOne({ _id: requestId, recipient: recipientId, status: 'pending' });

    if (!request) {
      return res.status(404).json({ msg: 'Pending request not found or not for you.' });
    }

    request.status = 'accepted';
    await request.save();

    // Add both users to each other's connections array
    const sender = await User.findById(request.sender);
    const recipient = await User.findById(recipientId);

    if (sender && recipient) {
      // Add to sender's connections if not already present
      if (!sender.connections.includes(recipientId)) {
        sender.connections.push(recipientId);
      }
      // Add to recipient's connections if not already present
      if (!recipient.connections.includes(request.sender)) {
        recipient.connections.push(request.sender);
      }
      await sender.save();
      await recipient.save();
    }

    // Remove request from both sender's sentRequests and recipient's receivedRequests
    await User.findByIdAndUpdate(request.sender, { $pull: { sentRequests: requestId } });
    await User.findByIdAndUpdate(recipientId, { $pull: { receivedRequests: requestId } });

    console.log(`Request ${requestId} accepted by user ${recipientId}.`);
    res.json({ message: 'Connection request accepted successfully.' });

  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    res.status(500).send('Server Error');
  }
});

// POST /review/rejected/:requestId - Reject a received request
router.post("/review/rejected/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const recipientId = req.user.id; // The authenticated user (recipient who is rejecting)

    const request = await ConnectionRequest.findOne({ _id: requestId, recipient: recipientId, status: 'pending' });

    if (!request) {
      return res.status(404).json({ msg: 'Pending request not found or not for you.' });
    }

    request.status = 'rejected';
    await request.save();

    // Remove request from both sender's sentRequests and recipient's receivedRequests
    await User.findByIdAndUpdate(request.sender, { $pull: { sentRequests: requestId } });
    await User.findByIdAndUpdate(recipientId, { $pull: { receivedRequests: requestId } });

    console.log(`Request ${requestId} rejected by user ${recipientId}.`);
    res.json({ message: 'Connection request rejected successfully.' });

  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    res.status(500).send('Server Error');
  }
});

// GET /connections - Get user's established connections

// GET /accepted-connections - Get all users whose request is accepted by the authenticated user
router.get('/accepted-connections', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all accepted connection requests where the authenticated user is the recipient
    const acceptedRequests = await ConnectionRequest.find({
      recipient: userId,
      status: 'accepted'
    }).populate('sender', '-password');

    // Extract the sender user objects
    const acceptedUsers = acceptedRequests.map(req => req.sender);

    res.json({
      message: 'Accepted connection requests received by user.',
      users: acceptedUsers
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// GET /all-connections - Get all users connected with the authenticated user
router.get('/all-connections', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all accepted requests where the user is either sender or recipient
    const acceptedRequests = await ConnectionRequest.find({
      status: 'accepted',
      $or: [
        { recipient: userId },
        { sender: userId }
      ]
    })
    .populate('sender', '-password')
    .populate('recipient', '-password');

    // Collect the other user in each connection
    const connectedUsers = acceptedRequests.map(req =>
      req.sender._id.toString() === userId ? req.recipient : req.sender
    );

    res.json({
      message: 'All connected users.',
      users: connectedUsers
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
