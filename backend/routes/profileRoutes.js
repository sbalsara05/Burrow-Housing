const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, changePassword } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload').default;
const { getProfile, updateProfile, uploadProfileImage, getProfileImagePresignedUrl, getPublicProfile } = require('../controllers/profileController');


router.get('/user', authenticateToken, getUserProfile);
// Fetch and Update Profile 
router.get("/profile", authenticateToken, getProfile);
router.get('/profile/public/:userId', getPublicProfile);

router.put('/updateUser', authenticateToken, updateUserProfile);
router.put('/user/change-password', authenticateToken, changePassword);
router.put("/profile", authenticateToken, updateProfile);

router.post('/upload-url', authenticateToken, getProfileImagePresignedUrl);


// Upload profile image
// router.post("/profile/image", upload, uploadProfileImage);


module.exports = router;
