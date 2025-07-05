const express = require("express");
const router = express.Router();
const {
	updateProperty,
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
} = require("../controllers/propertyController");

// Define property-specific routes
router.put("/api/properties/:propertyId", authenticateToken, updateProperty);

// api for image uploads
router.post("/properties/generate-upload-urls", authenticateToken, getPresignedUrls);
 
router.get("/properties", authenticateToken, getMyProperties);
router.post("/properties/add", authenticateToken, addNewProperty); 
router.get("/properties/all", getAllProperties);
router.get('/properties/id/:id', getPropertyById);

module.exports = router;