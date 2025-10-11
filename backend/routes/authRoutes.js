const express = require('express');
const router = express.Router();
const { register, login, googleSignIn, logout } = require('../controllers/authControllers');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requestPasswordReset, verifyResetToken, submitPasswordReset } = require('../controllers/passwordResetController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);
router.post('/google', googleSignIn);

// Logout route - requires authentication
router.post('/logout', authenticateToken, logout);

// Password Reset Route
router.post('/request-password-reset', requestPasswordReset);
router.get('/verify-reset-token', verifyResetToken);
router.post('/submit-password-reset', submitPasswordReset);

module.exports = router;
