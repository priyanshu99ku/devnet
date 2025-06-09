const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://priyanshukumar7393:Chikki1708@dev-cluster.ceroiob.mongodb.net/devnet?retryWrites=true&w=majority&appName=dev-cluster"
  );
};

module.exports = connectDB;
