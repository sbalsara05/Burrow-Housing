// const express = require('express');
// const router = express.Router();
// const User = require('../backend/UserSchema.js');

// // Create a new user
// router.post('/api/users', async (req, res) => {
//     try {
//         const user = new User(req.body); // Assuming your data matches the schema
//         await user.save();
//         res.status(201).json({ message: 'User created successfully', user });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });
//
// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('./UserSchema'); // Import the User schema
const bcrypt = require('bcryptjs');

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { username, first_name, last_name, email, majors_minors, school_attending, phone, about, role } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      first_name,
      last_name,
      email,
      majors_minors,
      school_attending,
      phone,
      about,
      //password: hashedPassword,
      role
    });

    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all users (for example)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
