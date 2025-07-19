const { getStreamClient } = require("../services/streamService");
const Interest = require("../models/interestModel");
const Notification = require("../models/notificationModel");
const Property = require("../models/propertyModel");
const mongoose = require("mongoose");

// GET /api/chat/token
exports.generateStreamToken = async (req, res) => {
	const userId = req.user.userId;
	try {
		if (!userId) {
			return res
				.status(400)
				.json({ message: "User ID is required." });
		}
		const client = getStreamClient();
		const token = client.createToken(userId);
		res.status(200).json({ token });
	} catch (error) {
		console.error("Error generating Stream token:", error);
		res.status(500).json({
			message: "Could not generate Stream token.",
		});
	}
};

// PUT /api/interests/:interestId/approve
exports.approveInterestAndCreateChannel = async (req, res) => {
	const { interestId } = req.params;
	const listerId = req.user.userId;

	try {
		const interest = await Interest.findById(interestId);
		if (!interest) {
			return res
				.status(404)
				.json({
					message: "Interest request not found.",
				});
		}

		// Security check: ensure the user making the request is the lister
		if (interest.listerId.toString() !== listerId) {
			return res
				.status(403)
				.json({
					message: "You are not authorized to approve this request.",
				});
		}

		if (interest.status === "approved") {
			return res
				.status(400)
				.json({
					message: "This request has already been approved.",
				});
		}

		const { renterId, propertyId } = interest;
		const client = getStreamClient();

		// Create a unique and predictable channel ID
		const channelId = `listing-${propertyId}-from-${renterId}-to-${listerId}`;

		const channel = client.channel("messaging", channelId, {
			name: `Inquiry for Property`, // You can customize this
			members: [listerId.toString(), renterId.toString()],
			created_by_id: listerId.toString(),
		});

		await channel.create();

		// Update the interest document
		interest.status = "approved";
		interest.streamChannelId = channel.cid;
		await interest.save();

		// --- Create Notification for the Renter ---
		const property = await Property.findById(propertyId).select(
			"overview.title"
		);
		const notificationMessage = `Your request for "${property.overview.title}" was approved! You can now chat with the lister.`;

		const newNotification = new Notification({
			userId: renterId,
			type: "interest_approved",
			message: notificationMessage,
			link: "/dashboard/chat", // Link to the chat page
			metadata: {
				propertyId: propertyId,
				listerId: listerId,
			},
		});
		await newNotification.save();
		// -----------------------------------------

		res.status(200).json({
			message: "Request approved and chat channel created.",
			interest,
		});
	} catch (error) {
		console.error("Error approving interest:", error);
		res.status(500).json({
			message: "Server error while approving interest.",
		});
	}
};

// PUT /api/interests/:interestId/decline
exports.declineInterest = async (req, res) => {
	const { interestId } = req.params;
	const listerId = req.user.userId;

	try {
		const interest = await Interest.findById(interestId);
		if (!interest) {
			return res
				.status(404)
				.json({
					message: "Interest request not found.",
				});
		}

		if (interest.listerId.toString() !== listerId) {
			return res
				.status(403)
				.json({
					message: "You are not authorized to decline this request.",
				});
		}

		if (interest.status !== "pending") {
			return res
				.status(400)
				.json({
					message: `This request is already ${interest.status}.`,
				});
		}

		interest.status = "declined";
		await interest.save();

		// --- Create Notification for the Renter ---
		const property = await Property.findById(
			interest.propertyId
		).select("overview.title");
		const notificationMessage = `Unfortunately, your request for "${property.overview.title}" was declined.`;

		const newNotification = new Notification({
			userId: interest.renterId,
			type: "interest_declined",
			message: notificationMessage,
			link: `/listing_details_01/${interest.propertyId}`, // Link back to the property
			metadata: {
				propertyId: interest.propertyId,
				listerId: listerId,
			},
		});
		await newNotification.save();
		// -----------------------------------------

		res.status(200).json({
			message: "Request declined successfully.",
			interest,
		});
	} catch (error) {
		console.error("Error declining interest:", error);
		res.status(500).json({
			message: "Server error while declining interest.",
		});
	}
};
