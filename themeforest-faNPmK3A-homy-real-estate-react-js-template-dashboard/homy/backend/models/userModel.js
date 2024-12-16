const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: {
    type: String,
    required: false, // Optional, set to `true` if you want to make it mandatory
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"], // E.164 format
  },
});

// Create the user model
const User = mongoose.model("User", userSchema);

module.exports = User;
