const express = require('express');
const router = express.Router();
const { register, login, googleSignIn, logout } = require('../controllers/authControllers');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requestPasswordReset, verifyResetToken, submitPasswordReset } = require('../controllers/passwordResetController');

// Wrap async handlers so rejections go to the global error handler (always JSON, never HTML)
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

// Register route
router.post('/register', asyncHandler(register));

// Login route
router.post('/login', asyncHandler(login));
router.post('/google', asyncHandler(googleSignIn));

// Logout route - requires authentication
router.post('/logout', authenticateToken, asyncHandler(logout));

// Password Reset Route
router.post('/request-password-reset', asyncHandler(requestPasswordReset));
router.get('/verify-reset-token', asyncHandler(verifyResetToken));
router.post('/submit-password-reset', asyncHandler(submitPasswordReset));

module.exports = router;
