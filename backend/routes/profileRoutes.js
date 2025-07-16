const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, changePassword } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { getProfile, updateProfile, uploadProfileImage, getProfileImagePresignedUrl } = require('../controllers/profileController');


router.get('/user', authenticateToken, getUserProfile);
router.put('/updateUser', authenticateToken, updateUserProfile);
router.put('/user/change-password', authenticateToken, changePassword);
// Fetch and Update Profile 
router.get("/profile", authenticateToken, getProfile);
console.log(updateProfile);
router.put("/profile", authenticateToken, upload, updateProfile);

router.post('/upload-url', authenticateToken, getProfileImagePresignedUrl);


// Upload profile image
// router.post("/profile/image", upload, uploadProfileImage);


module.exports = router;
