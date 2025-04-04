const express = require('express');
const router = express.Router();
const { updateProperty, getUserProfile, updateUserProfile} = require('../controllers/userController'); // Update controller imports
const { authenticateToken } = require('../middlewares/authMiddleware');
const addProperty = require("../../src/components/dashboard/add-property");
const {getMyProperties, addNewProperty} = require("../controllers/propertyController"); // Middleware for authentication

// Define property-specific routes
router.put('/api/properties/:propertyId', authenticateToken, updateProperty); // Update a specific property

module.exports = router;

router.get('/properties', authenticateToken,  getMyProperties); // getting the property data
router.post('/api/properties/add',authenticateToken ,addNewProperty); // adding a new property
