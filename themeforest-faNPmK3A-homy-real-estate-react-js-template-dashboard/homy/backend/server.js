// base structure

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./UserSchema'); // Import the User model

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const uri = 'mongodb+srv://hardishah0071:kFr1aYHCPvMUZuyR@cluster-burrow.xsloa.mongodb.net/'; // Replace with your MongoDB URI
mongoose
  .connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

// Example API Route
app.get('/api', (req, res) => {
  res.send('Hello from the backend!');
});


app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body; // Destructure data from request body

    const user = new User({
      name,
      email,
      password,
    });

    await user.save(); // Save the user to MongoDB

    res.status(201).json({ message: 'User created successfully' }); // Send success message
  } catch (error) {
    console.error('Error creating user:', error); // Log the error
    res.status(400).json({ error: error.message }); // Send error message
  }
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});