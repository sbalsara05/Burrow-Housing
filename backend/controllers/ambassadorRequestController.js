const AmbassadorRequest = require("../models/ambassadorRequestModel");
const Property = require("../models/propertyModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// POST /api/ambassador-requests
exports.submitAmbassadorRequest = async (req, res) => {
	const { propertyId, propertyTitle, inspectionPoints, preferredDates, contactInfo } = req.body;
	const requesterId = req.user.userId;

	try {
		if (!propertyId) {
			return res.status(400).json({ message: "Property ID is required." });
		}

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res.status(400).json({ message: "Invalid property ID." });
		}

		if (!inspectionPoints || !Array.isArray(inspectionPoints) || inspectionPoints.length === 0) {
			return res.status(400).json({ message: "At least one inspection point is required." });
		}

		if (!preferredDates || !preferredDates.trim()) {
			return res.status(400).json({ message: "Preferred dates are required." });
		}

		if (!contactInfo || !contactInfo.trim()) {
			return res.status(400).json({ message: "Contact information is required." });
		}

		const property = await Property.findById(propertyId);
		if (!property) {
			return res.status(404).json({ message: "Property not found." });
		}

		const listerId = property.userId;

		// Prevent lister from requesting ambassador for their own property
		if (listerId.toString() === requesterId) {
			return res.status(400).json({
				message: "You cannot request an ambassador for your own property.",
			});
		}

		// Check for existing request to prevent duplicates
		const existingRequest = await AmbassadorRequest.findOne({
			propertyId,
			requesterId,
		});
		if (existingRequest) {
			return res.status(409).json({
				message: `You have already submitted an ambassador request for this property. Current status: ${existingRequest.status}.`,
			});
		}

		const newRequest = new AmbassadorRequest({
			propertyId,
			listerId,
			requesterId,
			inspectionPoints,
			preferredDates: preferredDates.trim(),
			contactInfo: contactInfo.trim(),
			propertyTitle: propertyTitle || property.overview?.title || "Property",
		});

		await newRequest.save();

		// Create Notification for the Lister
		const requester = await User.findById(requesterId).select("name");
		if (!requester) {
			return res.status(404).json({ message: "Requester user not found." });
		}
		
		const notificationMessage = `${requester.name} requested an ambassador viewing for "${property.overview?.title || "your property"}".`;

		const newNotification = new Notification({
			userId: listerId,
			type: "ambassador_request",
			message: notificationMessage,
			link: "/dashboard/ambassador-requests",
			metadata: {
				propertyId: property._id,
				requesterId: requesterId,
				requestId: newRequest._id,
			},
		});
		await newNotification.save();

		res.status(201).json({
			message: "Ambassador request submitted successfully.",
			request: newRequest,
		});
	} catch (error) {
		console.error("Error submitting ambassador request:", error);
		res.status(500).json({
			message: "Server error while submitting ambassador request.",
		});
	}
};

// GET /api/ambassador-requests/received
exports.getReceivedAmbassadorRequests = async (req, res) => {
	const listerId = req.user.userId;

	try {
		const requests = await AmbassadorRequest.find({ listerId })
			.populate({
				path: "requesterId",
				select: "name email",
			})
			.populate({
				path: "propertyId",
				select: "overview images",
			})
			.sort({ createdAt: -1 })
			.lean();

		res.status(200).json(requests);
	} catch (error) {
		console.error("Error fetching received ambassador requests:", error);
		res.status(500).json({
			message: "Server error while fetching ambassador requests.",
		});
	}
};

// GET /api/ambassador-requests/sent
exports.getSentAmbassadorRequests = async (req, res) => {
	const requesterId = req.user.userId;

	try {
		const requests = await AmbassadorRequest.find({ requesterId })
			.populate({
				path: "listerId",
				select: "name",
			})
			.populate({
				path: "propertyId",
				select: "overview images addressAndLocation",
			})
			.sort({ createdAt: -1 });

		res.status(200).json(requests);
	} catch (error) {
		console.error("Error fetching sent ambassador requests:", error);
		res.status(500).json({
			message: "Server error while fetching sent ambassador requests.",
		});
	}
};

// GET /api/ambassador-requests/status?propertyId=:id
exports.getAmbassadorRequestStatusForProperty = async (req, res) => {
	const requesterId = req.user.userId;
	const { propertyId } = req.query;

	try {
		if (!propertyId) {
			return res.status(400).json({ message: "Property ID is required." });
		}

		const request = await AmbassadorRequest.findOne({
			requesterId,
			propertyId,
		}).select("status");

		if (!request) {
			return res.status(200).json({ status: null }); // No request found
		}

		res.status(200).json({ status: request.status });
	} catch (error) {
		console.error("Error fetching ambassador request status:", error);
		res.status(500).json({
			message: "Server error fetching ambassador request status.",
		});
	}
};

// PUT /api/ambassador-requests/:requestId/status
exports.updateAmbassadorRequestStatus = async (req, res) => {
	const { requestId } = req.params;
	const { status } = req.body;
	const userId = req.user.userId;

	try {
		if (!["approved", "declined", "completed", "cancelled"].includes(status)) {
			return res.status(400).json({
				message: "Invalid status. Allowed values: approved, declined, completed, cancelled.",
			});
		}

		const request = await AmbassadorRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({
				message: "Ambassador request not found.",
			});
		}

		// Only lister can update the status
		if (request.listerId.toString() !== userId.toString()) {
			return res.status(403).json({
				message: "You are not authorized to update this request.",
			});
		}

		request.status = status;
		await request.save();

		// Create Notification for the Requester
		try {
			const lister = await User.findById(userId).select("name");
			const property = await Property.findById(request.propertyId).select("overview.title");
			
			if (lister && property) {
				const notificationMessage = `${lister.name} ${status} your ambassador request for "${property.overview?.title || request.propertyTitle || "property"}".`;

				const newNotification = new Notification({
					userId: request.requesterId,
					type: "ambassador_request_update",
					message: notificationMessage,
					link: "/dashboard/my-requests",
					metadata: {
						propertyId: request.propertyId,
						requestId: request._id,
						status: status,
					},
				});
				await newNotification.save();
			}
		} catch (notificationError) {
			// Log notification error but don't fail the request update
			console.error("Error creating notification:", notificationError);
		}

		// If request is approved, notify all active ambassadors
		if (status === "approved") {
			try {
				const property = await Property.findById(request.propertyId).select("overview.title addressAndLocation");
				const activeAmbassadors = await User.find({
					isAmbassador: true,
					ambassadorStatus: "active",
				}).select("_id");

				// Create notifications for all active ambassadors
				const ambassadorNotifications = activeAmbassadors.map((ambassador) => {
					const address = property?.addressAndLocation?.address || request.propertyTitle || "a property";
					return {
						userId: ambassador._id,
						type: "ambassador_request",
						message: `New ambassador request available for "${property?.overview?.title || request.propertyTitle || "property"}" at ${address}`,
						link: "/dashboard/ambassador",
						metadata: {
							propertyId: request.propertyId,
							requestId: request._id,
						},
					};
				});

				if (ambassadorNotifications.length > 0) {
					await Notification.insertMany(ambassadorNotifications);
				}
			} catch (ambassadorNotificationError) {
				// Log error but don't fail the request update
				console.error("Error creating ambassador notifications:", ambassadorNotificationError);
			}
		}

		res.status(200).json({
			message: `Ambassador request ${status} successfully.`,
			request,
		});
	} catch (error) {
		console.error("Error updating ambassador request status:", error);
		res.status(500).json({
			message: "Server error while updating ambassador request status.",
		});
	}
};

// DELETE /api/ambassador-requests/:requestId
exports.cancelAmbassadorRequest = async (req, res) => {
	const requesterId = req.user.userId;
	const { requestId } = req.params;

	try {
		const request = await AmbassadorRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({
				message: "Ambassador request not found.",
			});
		}

		// Security Check: Only the requester who created it can cancel
		if (request.requesterId.toString() !== requesterId) {
			return res.status(403).json({
				message: "You are not authorized to cancel this request.",
			});
		}

		if (request.status !== "pending") {
			return res.status(400).json({
				message: `Cannot cancel a request with status '${request.status}'.`,
			});
		}

		request.status = "cancelled";
		await request.save();

		// Create Notification for the Lister
		const requester = await User.findById(requesterId).select("name");
		const property = await Property.findById(request.propertyId).select("overview.title");
		const notificationMessage = `${requester.name} cancelled their ambassador request for "${property.overview?.title || "your property"}".`;

		const newNotification = new Notification({
			userId: request.listerId,
			type: "ambassador_request_cancelled",
			message: notificationMessage,
			link: "/dashboard/ambassador-requests",
			metadata: {
				propertyId: request.propertyId,
				requesterId: requesterId,
				requestId: request._id,
			},
		});
		await newNotification.save();

		res.status(200).json({
			message: "Ambassador request cancelled successfully.",
			request,
		});
	} catch (error) {
		console.error("Error cancelling ambassador request:", error);
		res.status(500).json({
			message: "Server error while cancelling ambassador request.",
		});
	}
};
