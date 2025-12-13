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

// A requester cancels their ambassador request
router.delete("/ambassador-requests/:requestId", authenticateToken, cancelAmbassadorRequest);

module.exports = router;
