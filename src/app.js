require('dotenv').config();
const express = require("express");
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { initializeSocket } = require('./socket');
const app = express();


// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Explicitly set your frontend origin
  credentials: true, // Allow credentials (cookies)
 
}));

app.use(express.json());
app.use(cookieParser());




// Import routers
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const requestRoutes = require('./routes/requests');
const feedRoutes = require('./routes/feedRoutes'); // Assuming feedRoutes.js was already handled or exists separately


// Mount routers
app.use('/auth', authRoutes); // Authentication routes (signup, login, logout)
app.use('/profile', profileRoutes); // Profile management routes
app.use('/request', requestRoutes); // Connection request related routes
app.use('/feed', feedRoutes); // Mount feedRoutes under /feed

connectDB()
  .then(() => {
    console.log("Database connection established...");
    const server = app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
    initializeSocket(server);
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
    console.error(err.stack);
  });


