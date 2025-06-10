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

// POST /sent/ignored/:requestId - Mark sent request as ignored by sender
router.post("/sent/ignored/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id; // The authenticated user (sender who is ignoring)

    const request = await ConnectionRequest.findOne({ _id: requestId, sender: userId, status: 'pending' });

    if (!request) {
      return res.status(404).json({ msg: 'Pending request not found or not sent by you.' });
    }

    request.status = 'ignored';
    await request.save();

    // Optionally remove from sender's sentRequests array if you don't want to track ignored
    // Or keep it and filter by status when fetching sent requests
    await User.findByIdAndUpdate(userId, { $pull: { sentRequests: requestId } });

    console.log(`Sent request ${requestId} ignored by sender ${userId}.`);
    res.json({ message: 'Sent request marked as ignored successfully.' });

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
router.get("/connections", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('connections', '-password'); // Populate connections

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ message: 'Fetched user connections.', connections: user.connections });
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    res.status(500).send('Server Error');
  }
});

// GET /received - Get received connection requests
router.get("/received", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'receivedRequests',
      populate: {
        path: 'sender',
        select: '-password' // Exclude password from sender details
      }
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // Filter requests to show only pending ones or all, based on your UI needs
    const pendingRequests = user.receivedRequests.filter(req => req.status === 'pending');

    res.json({ message: 'Fetched received connection requests.', requests: pendingRequests });
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
