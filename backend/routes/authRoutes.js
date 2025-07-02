const express = require('express');
const router = express.Router();
const { register, login, googleSignIn, logout } = require('../controllers/authControllers');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);
router.post('/google', googleSignIn);

// Logout route - requires authentication
router.post('/logout', authenticateToken, logout);

module.exports = router;
