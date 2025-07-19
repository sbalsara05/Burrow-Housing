const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
	submitInterest,
	getReceivedInterests,
	getSentInterests,
    getInterestStatusForProperty,
    withdrawInterest
} = require("../controllers/interestController");

// A renter submits their interest for a property
router.post("/interests", authenticateToken, submitInterest);

// A lister gets all the requests they have received
router.get("/interests/received", authenticateToken, getReceivedInterests);
router.get('/interests/sent', authenticateToken, getSentInterests);
router.get('/interests/status', authenticateToken, getInterestStatusForProperty);

// A renter withdraws their interest
router.delete('/interests/:interestId', authenticateToken, withdrawInterest);

module.exports = router;
