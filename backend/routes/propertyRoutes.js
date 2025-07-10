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
    deleteProperty, 
} = require("../controllers/propertyController");

// Define property-specific routes
router.put("/api/properties/:propertyId", authenticateToken, updateProperty);

// api for image uploads
router.post("/properties/generate-upload-urls", authenticateToken, getPresignedUrls);
router.post("/properties/add", authenticateToken, addNewProperty); 

router.get("/properties", authenticateToken, getMyProperties);
router.get("/properties/all", getAllProperties);
router.get('/properties/id/:id', getPropertyById);

router.delete("/properties/:id", authenticateToken, deleteProperty);

module.exports = router;