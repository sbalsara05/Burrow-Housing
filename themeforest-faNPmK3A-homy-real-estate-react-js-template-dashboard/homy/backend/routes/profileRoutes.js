const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/profile', authenticateToken, getUserProfile);
router.put('/updateProfile', authenticateToken, updateUserProfile);

module.exports = router;
