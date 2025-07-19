const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
	submitInterest,
	getReceivedInterests,
	// approveInterestAndCreateChannel, // Will be in chatController for better separation
	// declineInterest
} = require("../controllers/interestController");

// A renter submits their interest for a property
router.post("/interests", authenticateToken, submitInterest);

// A lister gets all the requests they have received
router.get("/interests/received", authenticateToken, getReceivedInterests);

// We will place the approve/decline routes in chatRoutes or a new requestRoutes file
// for better organization, as they are actions that modify state and trigger chat.

module.exports = router;
