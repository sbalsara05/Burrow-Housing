const AmbassadorRequest = require("../models/ambassadorRequestModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");

// GET /api/ambassador/dashboard/stats
exports.getAmbassadorDashboardStats = async (req, res) => {
	const ambassadorId = req.user.userId;

	try {
		// Verify user is an active ambassador
		const ambassador = await User.findById(ambassadorId);
		if (!ambassador || !ambassador.isAmbassador || ambassador.ambassadorStatus !== "active") {
			return res.status(403).json({
				message: "Access denied. Ambassador access required.",
			});
		}

		// Get completed inspections count
		const completedCount = await AmbassadorRequest.countDocuments({
			ambassadorId,
			status: "completed",
		});

		// Get upcoming viewings (assigned and approved requests)
		const upcomingViewings = await AmbassadorRequest.find({
			ambassadorId,
			status: { $in: ["assigned", "approved"] },
			scheduledDate: { $gte: new Date() },
		})
			.sort({ scheduledDate: 1 })
			.limit(1)
			.populate("propertyId", "addressAndLocation overview")
			.populate("requesterId", "name")
			.lean();

		// Get pending follow-ups (completed but may need follow-up actions)
		const pendingFollowUps = await AmbassadorRequest.countDocuments({
			ambassadorId,
			status: "completed",
			// You can add additional criteria here for follow-ups
		});

		// Calculate completion rate (completed / total assigned)
		const totalAssigned = await AmbassadorRequest.countDocuments({
			ambassadorId,
			status: { $in: ["assigned", "approved", "completed"] },
		});
		const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

		// Get places viewed (use actual count from database for accuracy)
		// This is the accurate count of completed inspections
		const placesViewed = completedCount;

		res.status(200).json({
			placesViewed,
			upcomingViewings: upcomingViewings.length,
			nextViewing: upcomingViewings[0] || null,
			pendingFollowUps,
			completionRate,
			targetRate: 90,
		});
	} catch (error) {
		console.error("Error fetching ambassador dashboard stats:", error);
		res.status(500).json({
			message: "Server error while fetching ambassador dashboard stats.",
		});
	}
};

// GET /api/ambassador/dashboard/schedule
exports.getAmbassadorSchedule = async (req, res) => {
	const ambassadorId = req.user.userId;

	try {
		// Verify user is an active ambassador
		const ambassador = await User.findById(ambassadorId);
		if (!ambassador || !ambassador.isAmbassador || ambassador.ambassadorStatus !== "active") {
			return res.status(403).json({
				message: "Access denied. Ambassador access required.",
			});
		}

		// Get all assigned requests (not just today's) - show all assigned/approved requests
		const allAssignedRequests = await AmbassadorRequest.find({
			ambassadorId,
			status: { $in: ["assigned", "approved"] },
		})
			.sort({ scheduledDate: 1, createdAt: -1 }) // Sort by scheduled date, then by creation date
			.populate("propertyId", "addressAndLocation overview images")
			.populate("requesterId", "name email")
			.lean();

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		// Filter for today's schedule
		const todaySchedule = allAssignedRequests.filter((request) => {
			if (!request.scheduledDate) return true; // Include requests without scheduled date
			const scheduledDate = new Date(request.scheduledDate);
			return scheduledDate >= today && scheduledDate < tomorrow;
		});

		// Format schedule items
		const formattedSchedule = todaySchedule.map((request) => {
			const address = request.propertyId?.addressAndLocation?.address || "Address not available";
			const requesterName = request.requesterId?.name || "Unknown";
			const scheduledDate = request.scheduledDate ? new Date(request.scheduledDate) : null;
			const time = scheduledDate
				? scheduledDate.toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "2-digit",
						hour12: true,
				  })
				: "Time TBD";

			// Determine status color (you can customize this logic)
			let statusColor = "green"; // default
			if (request.status === "assigned") {
				statusColor = "orange";
			} else if (request.status === "approved") {
				statusColor = "red";
			}

			return {
				id: request._id,
				address,
				clientName: requesterName,
				time,
				statusColor,
				propertyId: request.propertyId?._id,
				requestId: request._id,
			};
		});

		res.status(200).json({
			schedule: formattedSchedule,
		});
	} catch (error) {
		console.error("Error fetching ambassador schedule:", error);
		res.status(500).json({
			message: "Server error while fetching ambassador schedule.",
		});
	}
};

// GET /api/ambassador/dashboard/request/:requestId
exports.getAmbassadorRequestDetails = async (req, res) => {
	const ambassadorId = req.user.userId;
	const { requestId } = req.params;

	console.log('getAmbassadorRequestDetails called with requestId:', requestId, 'ambassadorId:', ambassadorId);

	try {
		// Verify user is an active ambassador
		const ambassador = await User.findById(ambassadorId);
		if (!ambassador || !ambassador.isAmbassador || ambassador.ambassadorStatus !== "active") {
			return res.status(403).json({
				message: "Access denied. Ambassador access required.",
			});
		}

		// Get the request - ambassadors can view approved requests (to see before claiming) or requests assigned to them
		// First try to find by ID only, then check permissions
		if (!mongoose.Types.ObjectId.isValid(requestId)) {
			return res.status(400).json({
				message: "Invalid request ID.",
			});
		}

		const request = await AmbassadorRequest.findById(requestId)
			.populate("propertyId", "addressAndLocation overview images")
			.populate("requesterId", "name email")
			.populate("listerId", "name")
			.lean();

		if (!request) {
			return res.status(404).json({
				message: "Request not found.",
			});
		}

		// Check if ambassador has access: assigned to them OR approved (so they can view before claiming)
		const hasAccess = 
			(request.ambassadorId && request.ambassadorId.toString() === ambassadorId.toString()) ||
			request.status === "approved";

		if (!hasAccess) {
			return res.status(403).json({
				message: "You don't have access to this request.",
			});
		}

		res.status(200).json({
			request,
		});
	} catch (error) {
		console.error("Error fetching ambassador request details:", error);
		res.status(500).json({
			message: "Server error while fetching request details.",
		});
	}
};

// GET /api/ambassador/dashboard/activity
exports.getAmbassadorActivity = async (req, res) => {
	const ambassadorId = req.user.userId;

	try {
		// Verify user is an active ambassador
		const ambassador = await User.findById(ambassadorId);
		if (!ambassador || !ambassador.isAmbassador || ambassador.ambassadorStatus !== "active") {
			return res.status(403).json({
				message: "Access denied. Ambassador access required.",
			});
		}

		// Get recent activity (completed inspections, assigned requests, etc.)
		const recentRequests = await AmbassadorRequest.find({
			ambassadorId,
			status: { $in: ["completed", "assigned", "approved"] },
		})
			.sort({ updatedAt: -1 })
			.limit(10)
			.populate("propertyId", "addressAndLocation overview")
			.lean();

		// Format activity items
		const activities = recentRequests.map((request) => {
			const address = request.propertyId?.addressAndLocation?.address || "Address not available";
			const updatedAt = new Date(request.updatedAt);
			const now = new Date();
			const diffMs = now - updatedAt;
			const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
			const diffDays = Math.floor(diffHours / 24);

			let timeAgo = "";
			if (diffHours < 1) {
				timeAgo = "Just now";
			} else if (diffHours < 24) {
				timeAgo = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
			} else {
				timeAgo = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
			}

			let activityText = "";
			if (request.status === "completed") {
				activityText = `Completed inspection at ${address}`;
			} else if (request.status === "assigned") {
				activityText = `Assigned to inspection at ${address}`;
			} else if (request.status === "approved") {
				activityText = `Scheduled viewing for ${address}`;
			}

			return {
				id: request._id,
				activity: activityText,
				timeAgo,
				requestId: request._id,
			};
		});

		res.status(200).json({
			activities,
		});
	} catch (error) {
		console.error("Error fetching ambassador activity:", error);
		res.status(500).json({
			message: "Server error while fetching ambassador activity.",
		});
	}
};

// GET /api/ambassador/dashboard/pending-requests
exports.getPendingRequests = async (req, res) => {
	const ambassadorId = req.user.userId;

	try {
		// Verify user is an active ambassador
		const ambassador = await User.findById(ambassadorId);
		if (!ambassador || !ambassador.isAmbassador || ambassador.ambassadorStatus !== "active") {
			return res.status(403).json({
				message: "Access denied. Ambassador access required.",
			});
		}

		// Get pending requests that haven't been assigned yet
		// For now, we'll get all approved requests that aren't assigned
		// You can add location-based matching logic here
		const pendingRequests = await AmbassadorRequest.find({
			status: "approved",
			ambassadorId: { $exists: false }, // Not yet assigned
		})
			.sort({ createdAt: -1 })
			.populate("propertyId", "addressAndLocation overview images")
			.populate("requesterId", "name email")
			.lean();

		res.status(200).json({
			requests: pendingRequests,
		});
	} catch (error) {
		console.error("Error fetching pending requests:", error);
		res.status(500).json({
			message: "Server error while fetching pending requests.",
		});
	}
};

// POST /api/ambassador/dashboard/claim-request/:requestId
exports.claimRequest = async (req, res) => {
	const ambassadorId = req.user.userId;
	const { requestId } = req.params;
	const { scheduledDate } = req.body;

	try {
		// Verify user is an active ambassador
		const ambassador = await User.findById(ambassadorId);
		if (!ambassador || !ambassador.isAmbassador || ambassador.ambassadorStatus !== "active") {
			return res.status(403).json({
				message: "Access denied. Ambassador access required.",
			});
		}

		const request = await AmbassadorRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({
				message: "Request not found.",
			});
		}

		if (request.ambassadorId) {
			return res.status(400).json({
				message: "This request has already been assigned to another ambassador.",
			});
		}

		if (request.status !== "approved") {
			return res.status(400).json({
				message: "Only approved requests can be claimed.",
			});
		}

		// Assign the request to this ambassador
		request.ambassadorId = ambassadorId;
		request.status = "assigned";
		if (scheduledDate) {
			request.scheduledDate = new Date(scheduledDate);
		}
		await request.save();

		// Create notification for the ambassador
		try {
			const property = await Property.findById(request.propertyId).select("overview.title addressAndLocation");
			const address = property?.addressAndLocation?.address || request.propertyTitle || "a property";
			const title = property?.overview?.title || request.propertyTitle || "property";
			
			const notificationMessage = `You've claimed an ambassador request for "${title}" at ${address}. View inspection points to prepare.`;

			const newNotification = new Notification({
				userId: ambassadorId,
				type: "ambassador_request",
				message: notificationMessage,
				link: `/dashboard/ambassador/request/${request._id}`,
				metadata: {
					propertyId: request.propertyId,
					requestId: request._id,
				},
			});
			await newNotification.save();
			console.log(`[Ambassador Notification] Created claim notification for ambassador ${ambassadorId} for request ${request._id}`);
		} catch (notificationError) {
			// Log error but don't fail the claim
			console.error("Error creating notification:", notificationError);
		}

		res.status(200).json({
			message: "Request claimed successfully.",
			request,
		});
	} catch (error) {
		console.error("Error claiming request:", error);
		res.status(500).json({
			message: "Server error while claiming request.",
		});
	}
};
