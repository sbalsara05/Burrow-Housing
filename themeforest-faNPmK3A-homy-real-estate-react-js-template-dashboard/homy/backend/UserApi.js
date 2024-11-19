const express = require('express');
const router = express.Router();
const User = require('./backend/UserSchema.js');

// Create a new user
router.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body); // Assuming your data matches the schema
        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
