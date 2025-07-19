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
			return res.status(400).json({
				message: "You cannot show interest in your own property.",
			});
		}

		// Check for existing interest to prevent duplicates
		const existingInterest = await Interest.findOne({
			propertyId,
			renterId,
		});
		if (existingInterest) {
			return res.status(409).json({
				message: `You have already submitted a request for this property. Current status: ${existingInterest.status}.`,
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

// GET /api/interests/sent
exports.getSentInterests = async (req, res) => {
	const renterId = req.user.userId;
	try {
		const interests = await Interest.find({ renterId })
			.populate({
				path: "listerId",
				select: "name",
			})
			.populate({
				path: "propertyId",
				select: "overview images addressAndLocation",
			})
			.sort({ createdAt: -1 });

		res.status(200).json(interests);
	} catch (error) {
		console.error("Error fetching sent interests:", error);
		res.status(500).json({
			message: "Server error while fetching sent interests.",
		});
	}
};

// GET /api/interests/status?propertyId=:id
exports.getInterestStatusForProperty = async (req, res) => {
	const renterId = req.user.userId;
	const { propertyId } = req.query;
	try {
		if (!propertyId) {
			return res
				.status(400)
				.json({ message: "Property ID is required." });
		}
		const interest = await Interest.findOne({
			renterId,
			propertyId,
		}).select("status");
		if (!interest) {
			return res.status(200).json({ status: null }); // No interest found
		}
		res.status(200).json({ status: interest.status });
	} catch (error) {
		console.error("Error fetching interest status:", error);
		res.status(500).json({
			message: "Server error fetching interest status.",
		});
	}
};

// DELETE /api/interests/:interestId
exports.withdrawInterest = async (req, res) => {
	const renterId = req.user.userId;
	const { interestId } = req.params;
	try {
		const interest = await Interest.findById(interestId);
		if (!interest) {
			return res
				.status(404)
				.json({
					message: "Interest request not found.",
				});
		}
		// Security Check: Only the renter who created it can withdraw
		if (interest.renterId.toString() !== renterId) {
			return res
				.status(403)
				.json({
					message: "You are not authorized to withdraw this request.",
				});
		}
		if (interest.status !== "pending") {
			return res
				.status(400)
				.json({
					message: `Cannot withdraw a request with status '${interest.status}'.`,
				});
		}

		interest.status = "withdrawn";
		await interest.save();

		// --- Create Notification for the Lister ---
		const renter = await User.findById(renterId).select("name");
		const property = await Property.findById(
			interest.propertyId
		).select("overview.title");
		const notificationMessage = `${renter.name} withdrew their request for "${property.overview.title}".`;

		const newNotification = new Notification({
			userId: interest.listerId,
			type: "interest_withdrawn",
			message: notificationMessage,
			link: "/dashboard/requests",
			metadata: {
				propertyId: interest.propertyId,
				renterId: renterId,
			},
		});
		await newNotification.save();
		// -----------------------------------------

		res.status(200).json({
			message: "Request withdrawn successfully.",
			interest,
		});
	} catch (error) {
		console.error("Error withdrawing interest:", error);
		res.status(500).json({
			message: "Server error while withdrawing interest.",
		});
	}
};
