require('dotenv').config();
const express = require("express");
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { initializeSocket } = require('./socket');
const app = express();


// Middleware
app.use(cors({
  origin: 'https://dev-net.onrender.com',
  credentials: true,
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
    const PORT = process.env.PORT || 7777; // Use Render's PORT or fallback to 7777
    const server = app.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
    initializeSocket(server);
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
    console.error(err.stack);
  });


