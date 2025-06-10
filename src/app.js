const express = require("express");
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const User = require("./models/User");
const { validateSignupData, validateUpdateData } = require('./utils/validation');
const bcrypt = require('bcryptjs');
const auth = require('./middleware/auth'); // Import the auth middleware from the correct path

app.use(express.json());
app.use(cookieParser());

// Route to send dummy cookie (Postman-friendly)
app.get("/dummy-cookie", (req, res) => {
  const cookieValue = 'test-value-' + Date.now(); // Add timestamp to make it unique
  res.cookie('dummyCookie', cookieValue, {
    httpOnly: true,
    maxAge: 3600000, // 1 hour
    secure: process.env.NODE_ENV === 'production'
  });
  
  // Send back both the cookie details and the current cookies
  res.json({
    message: 'Dummy cookie has been set!',
    cookieDetails: {
      name: 'dummyCookie',
      value: cookieValue,
      maxAge: '1 hour',
      httpOnly: true
    },
    currentCookies: req.cookies
  });
});

app.post("/signup", async (req, res) => {
  const { errors, sanitizedData } = validateSignupData(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sanitizedData.password, salt);
    
    const user = new User({
      ...sanitizedData,
      password: hashedPassword
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

// New GET API for /feed
app.get("/feed", auth, async (req, res) => {
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

app.get("/user", auth, async (req, res) => {
  const userEmail = req.query.email;
  console.log('Received email for GET /user:', userEmail);

  try {
    const user = await User.findOne({ email: userEmail }).select('-password');

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Something went wrong");
  }
});

// New GET API for /users - Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// New DELETE API for /users/:id - Delete a user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

app.patch("/user", async (req, res) => {
  const { errors, sanitizedData } = validateUpdateData(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { userId, ...updateData } = sanitizedData;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
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

// Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log the token to console
    console.log('Generated JWT Token:', token);
    console.log('Token Payload:', jwt.decode(token));

    // Send user data (excluding password) and token
    const userData = user.toObject();
    delete userData.password;
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour in milliseconds
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

// New POST API for /send-connection-request
app.post("/send-connection-request", auth, async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user.id; // ID of the authenticated user

  if (!recipientId) {
    return res.status(400).json({ msg: 'Recipient ID is required' });
  }

  try {
    // In a real application, you would update user models here
    // e.g., add recipientId to sender's 'sentRequests' array
    // and add senderId to recipient's 'pendingRequests' array.
    // For this example, we'll just simulate success.

    // Find the recipient user (optional, but good for validation)
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient user not found' });
    }

    // Prevent sending request to self
    if (senderId === recipientId) {
      return res.status(400).json({ msg: 'Cannot send connection request to yourself' });
    }

    console.log(`Connection request sent from user ${senderId} to user ${recipientId}`);
    res.json({ success: true, message: 'Connection request sent successfully!' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });


