const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get Feed (all users) API
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      message: "Welcome to the Feed!",
      users: users
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 