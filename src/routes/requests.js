const express = require('express');
const router = express.Router();
const User = require('../models/User');
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
    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient user not found' });
    }

    if (senderId === interestedUserId) {
      return res.status(400).json({ msg: 'Cannot send connection request to yourself' });
    }

    // In a real app, logic to add to sentRequests/pendingRequests
    console.log(`Connection request sent from ${senderId} to ${interestedUserId}`);
    res.json({ success: true, message: 'Connection request sent successfully!' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// POST /sent/ignored/:userId - Mark sent request as ignored by sender (using userId for example)
router.post("/sent/ignored/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    // Logic to mark the request sent to userId as ignored by the authenticated user
    console.log(`Request sent to user ${userId} ignored by sender ${req.user.id}.`);
    res.json({ message: 'Sent request marked as ignored.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// POST /review/accepted/:requestId - Accept a received request
router.post("/review/accepted/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    // Logic to accept the request, establish connection
    console.log(`Request ${requestId} accepted by user ${req.user.id}.`);
    res.json({ message: 'Request accepted successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// POST /review/rejected/:requestId - Reject a received request
router.post("/review/rejected/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    // Logic to reject the request
    console.log(`Request ${requestId} rejected by user ${req.user.id}.`);
    res.json({ message: 'Request rejected successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// GET /connections - Get user's connections
router.get("/connections", auth, async (req, res) => {
  try {
    // Logic to fetch connections for the authenticated user
    res.json({ message: 'Fetched user connections.', connections: [] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// GET /received - Get received connection requests
router.get("/received", auth, async (req, res) => {
  try {
    // Logic to fetch received requests for the authenticated user
    res.json({ message: 'Fetched received connection requests.', requests: [] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
