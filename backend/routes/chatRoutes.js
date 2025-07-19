const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
    generateStreamToken,
    approveInterestAndCreateChannel,
    declineInterest
} = require('../controllers/chatController');

// Get a secure token for the authenticated user to connect to Stream
router.get('/chat/token', authenticateToken, generateStreamToken);

// --- Moving the approval/decline logic here as it's a Chat-creating action ---
router.put('/interests/:interestId/approve', authenticateToken, approveInterestAndCreateChannel);
router.put('/interests/:interestId/decline', authenticateToken, declineInterest);


module.exports = router;