const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireAmbassador } = require("../middlewares/ambassadorMiddleware");
const {
	getAmbassadorDashboardStats,
	getAmbassadorSchedule,
	getAmbassadorActivity,
	getPendingRequests,
	claimRequest,
	getAmbassadorRequestDetails,
} = require("../controllers/ambassadorDashboardController");

// All routes require authentication and ambassador role
router.use(authenticateToken);
router.use(requireAmbassador);

// Dashboard stats
router.get("/dashboard/stats", getAmbassadorDashboardStats);

// Today's schedule
router.get("/dashboard/schedule", getAmbassadorSchedule);

// Recent activity
router.get("/dashboard/activity", getAmbassadorActivity);

// Pending requests (available to claim)
router.get("/dashboard/pending-requests", getPendingRequests);

// Claim a request
router.post("/dashboard/claim-request/:requestId", claimRequest);

// Get request details
router.get("/dashboard/request/:requestId", getAmbassadorRequestDetails);

module.exports = router;
