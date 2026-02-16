const Interest = require("../models/interestModel");
const Property = require("../models/propertyModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const mongoose = require("mongoose");
const { queueNotificationEmail } = require("../utils/notificationEmailHelper");

/** Get a display name for a property (title, or "X Bed Category", never empty). */
function getPropertyDisplayName(property) {
	if (!property) return "your property";
	// Handle Mongoose subdocs: use .get?.(path) if present so we get plain values
	const getVal = (obj, key) => (obj && typeof obj.get === "function" ? obj.get(key) : obj?.[key]);
	const title = getVal(property.overview, "title");
	if (title != null && String(title).trim() !== "") return String(title).trim();
	const bedrooms = getVal(property.listingDetails, "bedrooms");
	const category = getVal(property.overview, "category") || "Property";
	const fallback = `${bedrooms != null ? bedrooms + " Bed " : ""}${category}`.trim();
	return fallback || "your property";
}

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

		const property = await Property.findById(propertyId).lean();
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
		const propertyDisplay = getPropertyDisplayName(property);
		const notificationMessage = `${renter.name} sent a request for "${propertyDisplay}".`;

		const newNotification = new Notification({
			userId: listerId,
			type: "new_interest",
			message: notificationMessage,
			link: "/dashboard/received-requests",
			metadata: {
				propertyId: property._id,
				renterId: renterId,
			},
		});
		await newNotification.save();

		// Queue email notification
		await queueNotificationEmail(listerId, "new_interest", {
			message: notificationMessage,
			link: "/dashboard/received-requests",
			metadata: {
				propertyId: property._id,
				renterId: renterId,
			},
		});
		// -----------------------------------------

		res.status(201).json({
			message: "Your request has been submitted successfully.",
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
				select: "name email", // Only get the renter's name initially
			})
			.populate({
				path: "propertyId",
				select: "overview images", // Get key property details
			})
			.sort({ createdAt: -1 }) // Show newest requests first
			.lean();

		const populatedInterests = await Promise.all(
			interests.map(async (interest) => {
				if (interest.renterId) {
					// Select all necessary public fields from the Profile model
					const renterProfile =
						await Profile.findOne({
							userId: interest
								.renterId._id,
						})
							.select(
								"username school_attending majors_minors image"
							)
							.lean();

					// Merge the profile info into the renterId object for the frontend
					if (renterProfile) {
						const userId =
							interest.renterId._id; // Preserve the User ID
						Object.assign(
							interest.renterId,
							renterProfile
						);
						interest.renterId._id = userId; // Restore the User ID (not Profile ID)
					}

					// Fallback for username if it doesn't exist on profile
					if (!interest.renterId.username) {
						interest.renterId.username =
							interest.renterId.name;
					}
				}
				return interest;
			})
		);

		res.status(200).json(populatedInterests);
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
			return res.status(404).json({
				message: "Request not found.",
			});
		}
		// Security Check: Only the renter who created it can withdraw
		if (interest.renterId.toString() !== renterId) {
			return res.status(403).json({
				message: "You are not authorized to withdraw this request.",
			});
		}
		if (interest.status !== "pending") {
			return res.status(400).json({
				message: `Cannot withdraw a request with status '${interest.status}'.`,
			});
		}

		interest.status = "withdrawn";
		await interest.save();

		// --- Create Notification for the Lister ---
		const renter = await User.findById(renterId).select("name");
		const property = await Property.findById(interest.propertyId)
			.select("overview.title overview.category listingDetails.bedrooms")
			.lean();
		const propertyDisplay = getPropertyDisplayName(property);
		const notificationMessage = `${renter.name} withdrew their request for "${propertyDisplay}".`;

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

		// Queue email notification
		await queueNotificationEmail(interest.listerId, "interest_withdrawn", {
			message: notificationMessage,
			link: "/dashboard/requests",
			metadata: {
				propertyId: interest.propertyId,
				renterId: renterId,
			},
		});
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
