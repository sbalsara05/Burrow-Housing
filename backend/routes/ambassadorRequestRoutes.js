const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
	submitAmbassadorRequest,
	getReceivedAmbassadorRequests,
	getSentAmbassadorRequests,
	getAmbassadorRequestStatusForProperty,
	updateAmbassadorRequestStatus,
	cancelAmbassadorRequest,
	submitAmbassadorReview,
} = require("../controllers/ambassadorRequestController");

// A requester submits an ambassador request for a property
router.post("/ambassador-requests", authenticateToken, submitAmbassadorRequest);

// A lister gets all the ambassador requests they have received
router.get("/ambassador-requests/received", authenticateToken, getReceivedAmbassadorRequests);

// A requester gets all the ambassador requests they have sent
router.get("/ambassador-requests/sent", authenticateToken, getSentAmbassadorRequests);

// Get the status of an ambassador request for a specific property
router.get("/ambassador-requests/status", authenticateToken, getAmbassadorRequestStatusForProperty);

// A lister updates the status of an ambassador request (approve/decline/complete)
router.put("/ambassador-requests/:requestId/status", authenticateToken, updateAmbassadorRequestStatus);

// An ambassador submits a review for a completed inspection
// IMPORTANT: This route must come BEFORE the DELETE /:requestId route to avoid conflicts
router.put("/ambassador-requests/:requestId/review", authenticateToken, submitAmbassadorReview);

// A requester cancels their ambassador request
router.delete("/ambassador-requests/:requestId", authenticateToken, cancelAmbassadorRequest);

module.exports = router;
