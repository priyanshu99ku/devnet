const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { validateUpdateData } = require('../utils/validation');
const auth = require('../middleware/auth');

// Get Profile API
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Patch Profile Edit API
router.patch("/profile/edit", auth, async (req, res) => {
  const { errors, sanitizedData } = validateUpdateData(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Ensure the authenticated user is only updating their own profile
  if (req.user.id !== sanitizedData.userId) {
      return res.status(403).json({ msg: 'Unauthorized: Cannot update another user\'s profile.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, // Update based on authenticated user's ID
      { $set: sanitizedData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Patch Profile Password API
router.patch("/profile/password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Current and new password are required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid current password.' });
    }

    // Validate new password with schema validator (pre-save hook will hash)
    user.password = newPassword;
    await user.save(); // This will trigger the pre('save') hook for hashing and schema validation

    res.json({ msg: 'Password updated successfully.' });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ errors });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
