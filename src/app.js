const express = require("express");
const connectDB = require('./config/database');
const app = express();
const User = require("./models/User");

app.use(express.json());

app.post("/signup", async (req, res) => {
  // Extract user data from request body
  const { firstName, lastName, email, password, age, gender } = req.body;

  // Creating a new instance of the User model
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    age,
    gender,
  });

  try {
    await user.save();
    console.log('User saved successfully:', user);
    res.send("User Added successfully!");
  } catch (err) {
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

// New PATCH API for /user - Update a user
app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;

  try {
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
    });
    console.log(user);
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("Something went wrong");
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


