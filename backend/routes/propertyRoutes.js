const express = require("express");
const router = express.Router();
const {
	getUserProfile,
	updateUserProfile,
} = require("../controllers/userController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
	getMyProperties,
	addNewProperty,
    getAllProperties,
    getPropertyById,
    getPresignedUrls,
    deleteProperty, 
    updateProperty,
    getPropertiesByUserId,
} = require("../controllers/propertyController");

// api for image uploads
router.post("/properties/generate-upload-urls", authenticateToken, getPresignedUrls);
router.post("/properties/add", authenticateToken, addNewProperty); 

router.get("/properties", authenticateToken, getMyProperties);
router.get("/properties/all", getAllProperties);
router.get('/properties/id/:id', getPropertyById);
router.get('/properties/user/:userId', getPropertiesByUserId);

router.delete("/properties/:id", authenticateToken, deleteProperty);

router.put("/properties/:id", authenticateToken, updateProperty);

module.exports = router;