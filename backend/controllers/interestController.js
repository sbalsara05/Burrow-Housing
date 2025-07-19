const Interest = require("../models/interestModel");
const Property = require("../models/propertyModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// POST /api/interests
exports.submitInterest = async (req, res) => {
	const { propertyId, message, moveInDate } = req.body;
	const renterId = req.user.userId;

	try {
		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res
				.status(400)
				.json({ message: "Invalid property ID." });
		}

		const property = await Property.findById(propertyId);
		if (!property) {
			return res
				.status(404)
				.json({ message: "Property not found." });
		}

		const listerId = property.userId;

		// Prevent lister from showing interest in their own property
		if (listerId.toString() === renterId) {
			return res
				.status(400)
				.json({
					message: "You cannot show interest in your own property.",
				});
		}

		// Check for existing interest to prevent duplicates
		const existingInterest = await Interest.findOne({
			propertyId,
			renterId,
		});
		if (existingInterest) {
			return res
				.status(409)
				.json({
					message: "You have already shown interest in this property.",
				});
		}

		const newInterest = new Interest({
			propertyId,
			listerId,
			renterId,
			message,
			moveInDate,
		});

		await newInterest.save();

		// --- Create Notification for the Lister ---
		const renter = await User.findById(renterId).select("name");
		const notificationMessage = `${renter.name} sent an inquiry for "${property.overview.title}".`;

		const newNotification = new Notification({
			userId: listerId,
			type: "new_interest",
			message: notificationMessage,
			link: "/dashboard/requests",
			metadata: {
				propertyId: property._id,
				renterId: renterId,
			},
		});
		await newNotification.save();
		// -----------------------------------------

		res.status(201).json({
			message: "Your interest has been submitted successfully.",
			interest: newInterest,
		});
	} catch (error) {
		console.error("Error submitting interest:", error);
		res.status(500).json({
			message: "Server error while submitting interest.",
		});
	}
};

// GET /api/interests/received
exports.getReceivedInterests = async (req, res) => {
	const listerId = req.user.userId;

	try {
		const interests = await Interest.find({ listerId })
			.populate({
				path: "renterId",
				select: "name", // Only get the renter's name initially
			})
			.populate({
				path: "propertyId",
				select: "overview images", // Get key property details
			})
			.sort({ createdAt: -1 }); // Show newest requests first

		res.status(200).json(interests);
	} catch (error) {
		console.error("Error fetching received interests:", error);
		res.status(500).json({
			message: "Server error while fetching interests.",
		});
	}
};

// PUT /api/interests/:interestId (Handles approve/decline)
// Note: This endpoint is now split into two more specific endpoints as per the plan.
// We will create approveInterest and declineInterest controllers instead.
