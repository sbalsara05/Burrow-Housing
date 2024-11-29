// // base structure
//
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const User = require('./UserSchema'); // Import the User model
//
// const app = express();
//
// // Middleware
// app.use(express.json());
// const corsOptions = {
//   origin: 'http://127.0.0.1:5173', // Allow this specific origin
//   optionsSuccessStatus: 200
// };
// app.use(cors(corsOptions));
// // MongoDB Connection
// const uri = 'mongodb+srv://hardishah0071:kFr1aYHCPvMUZuyR@cluster-burrow.xsloa.mongodb.net/'; // Replace with your MongoDB URI
// mongoose.connect(
//   uri,
//     {
//     useNewUrlParser: true
//   }
// )
// .then(() => console.log('MongoDB connected'))
// .catch((err) => console.error('Connection error:', err));
//
// // Example API Route
// app.get('/api', (req, res) => {
//   res.send('Hello from the backend!');
// });
//
//

// // Start the Server
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: 'http://127.0.0.1:5173', // Allow this specific origin
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// MongoDB Connection
const uri = 'mongodb+srv://sbalsara:Seattleusa22@cluster-burrow.xsloa.mongodb.net/';
mongoose
  .connect(uri, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

// API Routes
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Hello from the backend!',
    data: [1, 2, 3, 4]
  });
});
app.post('/users', async (req, res) => {
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


// For development, you might want to comment out these lines
// // Serve static files from React build directory (uncomment when in production)
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'build')));

//   // Catch-all route to serve React app for any unmatched route
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
//   });
// }

// Start the Server
const PORT = process.env.PORT || 3000; // Use a different port from React's default
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
