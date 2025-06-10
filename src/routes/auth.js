const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { validateSignupData } = require('../utils/validation');
const auth = require('../middleware/auth');

// Signup API
router.post("/signup", async (req, res) => {
  const { errors, sanitizedData } = validateSignupData(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = new User({
      ...sanitizedData,
    });

    await user.save();
    console.log('User saved successfully:', user);
    res.send("User Added successfully!");
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Login API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = user.generateAuthToken();

    console.log('Generated JWT Token:', token);
    
    const userData = user.toObject();
    delete userData.password;
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });
    
    res.json({
      msg: 'Login successful',
      user: userData,
      token
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Logout API
router.post("/logout", auth, async (req, res) => {
  try {
    res.clearCookie('token'); // Clear the JWT token cookie
    res.json({ msg: 'Logged out successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
