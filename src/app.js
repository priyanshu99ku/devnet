const express = require("express");
const connectDB = require('./config/database');
const app = express();
const User = require("./models/User");

app.post("/signup", async (req, res) => {
  // Creating a new instance of the User model
  const user = new User({
    firstName: "Akshay",
    lastName: "Saini",
    email: "akshay@saini.com", // Changed emailId to email based on your schema
    password: "akshay@123",
  });

  try {
    await user.save();
    res.send("User Added successfully!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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


