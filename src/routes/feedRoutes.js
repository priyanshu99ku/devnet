const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ConnectionRequest = require('../models/connectionRequest');
const auth = require('../middleware/auth');

// Get Feed (all users) API
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the current user with connections and requests
    const user = await User.findById(userId)
      .populate('connections', '_id')
      .populate('sentRequests', 'recipient status')
      .populate('receivedRequests', 'sender status');

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // 1. Exclude own card
    let excludeIds = [user._id.toString()];

    // 2. Exclude connections
    excludeIds.push(...user.connections.map(conn => conn._id.toString()));

    // 3. Exclude ignored people (from sent or received requests)
    const ignoredUserIds = [];
    user.sentRequests.forEach(req => {
      if (req.status === 'ignored') ignoredUserIds.push(req.recipient.toString());
    });
    user.receivedRequests.forEach(req => {
      if (req.status === 'ignored') ignoredUserIds.push(req.sender.toString());
    });
    excludeIds.push(...ignoredUserIds);

    // 4. Exclude users already sent a connection request (pending)
    const sentPendingIds = user.sentRequests
      .filter(req => req.status === 'pending')
      .map(req => req.recipient.toString());
    excludeIds.push(...sentPendingIds);

    // Remove duplicates
    excludeIds = [...new Set(excludeIds)];

    // Query for users not in excludeIds
    const users = await User.find({ _id: { $nin: excludeIds } })
      .select('-password');

    res.json({
      message: "Welcome to the Feed!",
      users
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// GET /connections - Get user's established connections
router.get("/connections", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate({
        path: 'connections',
        select: '-password',
        populate: {
          path: 'profile',
          select: 'name bio profilePicture'
        }
      });

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ 
      message: 'Fetched user connections.', 
      connections: user.connections 
    });
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
        select: '-password',
        populate: {
          path: 'profile',
          select: 'name bio profilePicture'
        }
      }
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // Filter requests to show only pending ones
    const pendingRequests = user.receivedRequests.filter(req => req.status === 'pending');

    res.json({ 
      message: 'Fetched received connection requests.', 
      requests: pendingRequests 
    });
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    res.status(500).send('Server Error');
  }
});

module.exports = router;