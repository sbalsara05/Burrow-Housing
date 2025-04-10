const express = require("express");
const router = express.Router();
const {
	updateProperty,
	getUserProfile,
	updateUserProfile,
} = require("../controllers/userController"); // Update controller imports
const { authenticateToken } = require("../middlewares/authMiddleware");
//const addProperty = require("../../src/components/dashboard/add-property");
const upload = require("../middlewares/upload").default;
const {
	getMyProperties,
	addNewProperty,
    getAllProperties,
    getPropertyById
} = require("../controllers/propertyController");

// Define property-specific routes
router.put("/api/properties/:propertyId", authenticateToken, updateProperty); // Update a specific property
 
router.get("/properties", authenticateToken, getMyProperties); // getiing the property data
router.post("/properties/add", authenticateToken, upload, addNewProperty); // adding a new property
// Get all properties route
router.get("/properties/all", getAllProperties);
router.get('/properties/id/:id', getPropertyById);

module.exports = router;
