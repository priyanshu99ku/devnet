const express = require("express");
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const app = express();

// Import routers
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const requestRoutes = require('./routes/requests');
const feedRoutes = require('./routes/feedRoutes'); // Assuming feedRoutes.js was already handled or exists separately

app.use(express.json());
app.use(cookieParser());

// Mount routers
app.use('/auth', authRoutes); // Authentication routes (signup, login, logout)
app.use('/profile', profileRoutes); // Profile management routes
app.use('/request', requestRoutes); // Connection request related routes

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
    console.error(err.stack);
  });


