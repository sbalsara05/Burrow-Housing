const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload').default;
const { getProfile, updateProfile, uploadProfileImage } = require('../controllers/profileController');


router.get('/user', authenticateToken, getUserProfile);
router.put('/updateUser', authenticateToken, updateUserProfile);

// Fetch and Update Profile 
router.get("/profile", authenticateToken, getProfile);
console.log(updateProfile);
router.put("/profile", authenticateToken, upload, updateProfile);

// Upload profile image
// router.post("/profile/image", upload, uploadProfileImage);


module.exports = router;
