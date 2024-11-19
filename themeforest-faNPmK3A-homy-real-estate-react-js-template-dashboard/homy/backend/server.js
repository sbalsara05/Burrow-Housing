// base structure

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const uri = 'mongodb+srv://hardishah0071:kFr1aYHCPvMUZuyR@cluster-burrow.xsloa.mongodb.net/'; // Replace with your MongoDB URI
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

// Example API Route
app.get('/api', (req, res) => {
  res.send('Hello from the backend!');
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});