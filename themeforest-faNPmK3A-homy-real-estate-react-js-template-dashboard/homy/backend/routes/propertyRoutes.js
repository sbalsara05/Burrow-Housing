const express = require('express');
const router = express.Router();
const { updateProperty } = require('../controllers/userController'); // Update controller imports
const { authenticateToken } = require('../middlewares/authMiddleware'); // Middleware for authentication

// Define property-specific routes
router.put('/api/properties/:propertyId', authenticateToken, updateProperty); // Update a specific property

module.exports = router;
