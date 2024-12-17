const User = require('../models/userModel'); // Mongoose User model

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token
        console.log('Here is the req id ' + JSON.stringify(userId));
        const user = await User.findById(userId); // Fetch selected fields

        console.log('Here is the user details ', user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.updateUserProfile = async (req, res) => {
    const { name, phone } = req.body;  // Get data from the request body
    const userId = req.user.userId; // User ID from JWT

    try {
        // Find user by ID and update their information
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log('Here is the user details ', user);


        // Update user data
        user.name = name || user.name; // Update name, keep old if not provided
        user.phone = phone || user.phone; // Update phone, keep old if not provided

        // Save the updated user data
        await user.save();

        // Return updated user data
        res.status(200).json({
            message: "User data updated successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user profile" });
    }
};