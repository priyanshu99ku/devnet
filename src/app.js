const express = require("express");
const connectDB = require('./config/database');
const app = express();
const User = require("./models/User");
const { validateSignupData, validateUpdateData } = require('./utils/validation');
const bcrypt = require('bcryptjs');

app.use(express.json());

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
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Fetch all users, exclude password
    res.json({
      message: "Welcome to the Feed!",
      users: users
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// New GET API for /user by email (matching image structure, using 'email' for schema compatibility)
app.get("/user", async (req, res) => {
  const userEmail = req.body.email; // Using 'email' to match User schema field
  console.log('Received email for GET /user:', userEmail);

  try {
    const user = await User.findOne({ email: userEmail }).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).send("User not found"); // Send 404 if user is not found
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
    const users = await User.find({}).select('-password'); // Exclude password
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

    // Send user data (excluding password)
    const userData = user.toObject();
    delete userData.password;
    
    res.json({
      msg: 'Login successful',
      user: userData
    });

  } catch (err) {
    console.error(err.message);
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


