const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const User = require('../models/userModel');
const Property = require('../models/propertyModel');

// GET /api/favorites - Get user's favorites
router.get('/favorites', authenticateToken, async (req, res) => {
    try {
        console.log('=== FAVORITES GET REQUEST ===');
        console.log('User from token:', req.user);

        // Fix: Use userId instead of id (this is what your JWT tokens contain)
        const userId = req.user.userId;
        console.log('Using userId:', userId);

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const user = await User.findById(userId).populate('favorites');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user.email);
        console.log('User favorites:', user.favorites);

        res.json({ favorites: user.favorites || [] });
    } catch (error) {
        console.error('=== FAVORITES GET ERROR ===');
        console.error('Error details:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// POST /api/favorites - Add property to favorites
router.post('/favorites', authenticateToken, async (req, res) => {
    try {
        console.log('=== FAVORITES POST REQUEST ===');
        const { propertyId } = req.body;
        console.log('Adding property to favorites:', propertyId);

        // Fix: Use userId instead of id
        const userId = req.user.userId;
        console.log('Using userId:', userId);

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.favorites) {
            user.favorites = [];
        }

        if (!user.favorites.includes(propertyId)) {
            user.favorites.push(propertyId);
            await user.save();
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json({ property });
    } catch (error) {
        console.error('=== FAVORITES POST ERROR ===');
        console.error('Error details:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// DELETE /api/favorites/:propertyId - Remove property from favorites
router.delete('/favorites/:propertyId', authenticateToken, async (req, res) => {
    try {
        console.log('=== FAVORITES DELETE REQUEST ===');
        const { propertyId } = req.params;
        console.log('Removing property from favorites:', propertyId);

        // Fix: Use userId instead of id
        const userId = req.user.userId;
        console.log('Using userId:', userId);

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.favorites) {
            user.favorites = user.favorites.filter(id => id.toString() !== propertyId);
            await user.save();
        }

        res.json({ message: 'Property removed from favorites' });
    } catch (error) {
        console.error('=== FAVORITES DELETE ERROR ===');
        console.error('Error details:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;