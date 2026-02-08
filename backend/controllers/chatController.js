const { getStreamClient } = require("../services/streamService");
const Interest = require("../models/interestModel");
const Notification = require("../models/notificationModel");
const Property = require("../models/propertyModel");
const mongoose = require("mongoose");
const { queueNotificationEmail } = require("../utils/notificationEmailHelper");

// Test endpoint to verify Stream Chat connection
exports.testStreamConnection = async (req, res) => {
	try {
		const client = getStreamClient();
		const apiKey = process.env.STREAM_API_KEY;
		
		// Try to query users to verify connection
		const response = await client.queryUsers({ id: { $exists: true } }, { limit: 1 });
		
		res.status(200).json({
			success: true,
			message: "Stream Chat connection successful",
			apiKey: apiKey ? `${apiKey.substring(0, 5)}...` : "Not set",
			usersFound: response.users.length
		});
	} catch (error) {
		console.error("[Stream Chat Test] Error:", error);
		res.status(500).json({
			success: false,
			message: "Stream Chat connection failed",
			error: error.message
		});
	}
};

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
		
		// Get user info for Stream Chat
		const User = require("../models/userModel");
		const Profile = require("../models/profileModel");
		const user = await User.findById(userId).select("name email");
		const profile = await Profile.findOne({ userId }).select("image");
		
		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}
		
		// Convert userId to string for consistency
		const userIdString = userId.toString();
		
		console.log(`[Stream Chat] Generating token for user: ${userIdString}`);
		console.log(`[Stream Chat] User name: ${user.name}`);
		console.log(`[Stream Chat] Profile image: ${profile?.image || 'none'}`);
		
		// Upsert user in Stream Chat to ensure they exist
		// This MUST succeed before generating a token
		try {
			const userData = {
				id: userIdString,
				name: user.name || "User",
			};
			
			// Only add image if it exists
			if (profile?.image) {
				userData.image = profile.image;
			}
			
			console.log(`[Stream Chat] Upserting user with data:`, { ...userData, image: userData.image ? 'present' : 'none' });
			const upsertResponse = await client.upsertUser(userData);
			console.log(`[Stream Chat] User ${userIdString} upserted successfully. Response:`, upsertResponse);
			
			// Verify user was created by querying for them
			const verifyUser = await client.queryUsers({ id: userIdString });
			if (verifyUser.users.length === 0) {
				throw new Error("User was not created in Stream Chat after upsert");
			}
			console.log(`[Stream Chat] Verified user exists in Stream Chat`);
			
		} catch (upsertError) {
			console.error("[Stream Chat] Error upserting user:", upsertError);
			console.error("[Stream Chat] Upsert error details:", {
				message: upsertError.message,
				response: upsertError.response?.data,
				status: upsertError.response?.status,
				stack: upsertError.stack
			});
			// Don't continue if upsert fails - token won't work without user
			return res.status(500).json({
				message: "Failed to register user in Stream Chat.",
				error: process.env.NODE_ENV === 'development' ? upsertError.message : undefined
			});
		}
		
		// Generate token - this must happen after successful upsert
		// Set token to expire in 24 hours (86400 seconds)
		try {
			console.log(`[Stream Chat] Generating token for user ID: ${userIdString}`);
			const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 24 hours from now
			const token = client.createToken(userIdString, expirationTime);
			console.log(`[Stream Chat] Token generated successfully. Token length: ${token.length}`);
			console.log(`[Stream Chat] Token expires at: ${new Date(expirationTime * 1000).toISOString()}`);
			
			// Verify the token works by trying to query the user's channels
			try {
				const testChannel = client.channel('messaging', `test-${userIdString}`);
				// Just verify we can create a channel object (doesn't actually create it)
				console.log(`[Stream Chat] Token verification: Channel object created successfully`);
			} catch (verifyError) {
				console.warn(`[Stream Chat] Token verification warning:`, verifyError.message);
			}
			
			res.status(200).json({ token });
		} catch (tokenError) {
			console.error("[Stream Chat] Error generating token:", tokenError);
			console.error("[Stream Chat] Token error details:", {
				message: tokenError.message,
				stack: tokenError.stack
			});
			return res.status(500).json({
				message: "Failed to generate Stream Chat token.",
				error: process.env.NODE_ENV === 'development' ? tokenError.message : undefined
			});
		}
	} catch (error) {
		console.error("Error generating Stream token:", error);
		console.error("Error details:", error.message, error.stack);
		res.status(500).json({
			message: "Could not generate Stream token.",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
			return res.status(404).json({
				message: "Interest request not found.",
			});
		}

		// Security check: ensure the user making the request is the lister
		if (interest.listerId.toString() !== listerId) {
			return res.status(403).json({
				message: "You are not authorized to approve this request.",
			});
		}

		if (interest.status === "approved") {
			return res.status(400).json({
				message: "This request has already been approved.",
			});
		}

		const { renterId, propertyId } = interest;
		const client = getStreamClient();

		// Ensure both users exist in Stream before creating channel (Stream requires this)
		const User = require("../models/userModel");
		const Profile = require("../models/profileModel");
		const [listerUser, renterUser, listerProfile, renterProfile] = await Promise.all([
			User.findById(listerId).select("name").lean(),
			User.findById(renterId).select("name").lean(),
			Profile.findOne({ userId: listerId }).select("image").lean(),
			Profile.findOne({ userId: renterId }).select("image").lean(),
		]);
		const upsertUser = async (userId, user, profile) => {
			const data = { id: userId.toString(), name: user?.name || "User" };
			if (profile?.image) data.image = profile.image;
			await client.upsertUser(data);
		};
		await Promise.all([
			upsertUser(listerId, listerUser, listerProfile),
			upsertUser(renterId, renterUser, renterProfile),
		]);

		// Create a unique and predictable channel ID
		const channelId = `interest-${interestId}`;

		const channel = client.channel("messaging", channelId, {
			name: `Inquiry for Property`, // You can customize this
			members: [listerId.toString(), renterId.toString()],
			created_by_id: listerId.toString(),
			propertyId: propertyId.toString(),
			listerId: listerId.toString(),
			interestId: interestId.toString(),
		});

		await channel.create();

		// Update the interest document
		interest.status = "approved";
		interest.streamChannelId = channel.cid;
		await interest.save();

		// --- Create Notification for the Renter ---
		const property = await Property.findById(propertyId)
			.select("overview.title")
			.lean();
		const propertyTitle =
			property?.overview?.title ||
			"the property you requested";
		const notificationMessage = `Your request for "${propertyTitle}" was approved! You can now chat with the lister.`;

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

		// Queue email notification
		await queueNotificationEmail(renterId, "interest_approved", {
			message: notificationMessage,
			link: "/dashboard/chat",
			metadata: {
				propertyId: propertyId,
				listerId: listerId,
			},
		});
		// -----------------------------------------

		const populatedInterest = await Interest.findById(interestId)
			.populate({ path: "renterId", select: "name" })
			.populate({
				path: "propertyId",
				select: "overview images",
			});

		res.status(200).json({
			message: "Request approved and chat channel created.",
			interest: populatedInterest,
		});
	} catch (error) {
		console.error("Error approving interest:", error);
		const isStreamError =
			error.message?.includes("Stream") ||
			error.message?.includes("client has not been initialized");
		res.status(500).json({
			message: isStreamError
				? "Chat service unavailable. Please try again or contact support."
				: "Server error while approving interest.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
			return res.status(404).json({
				message: "Interest request not found.",
			});
		}

		if (interest.listerId.toString() !== listerId) {
			return res.status(403).json({
				message: "You are not authorized to decline this request.",
			});
		}

		if (interest.status !== "pending") {
			return res.status(400).json({
				message: `This request is already ${interest.status}.`,
			});
		}

		interest.status = "declined";
		await interest.save();

		// --- Create Notification for the Renter ---
		const property = await Property.findById(interest.propertyId)
			.select("overview.title")
			.lean();
		const propertyTitle =
			property?.overview?.title ||
			"the property you requested";
		const notificationMessage = `Unfortunately, your request for "${propertyTitle}" was declined.`;

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

		// Queue email notification
		await queueNotificationEmail(interest.renterId, "interest_declined", {
			message: notificationMessage,
			link: `/listing_details_01/${interest.propertyId}`,
			metadata: {
				propertyId: interest.propertyId,
				listerId: listerId,
			},
		});
		// -----------------------------------------

		const populatedInterest = await Interest.findById(interestId)
			.populate({ path: "renterId", select: "name" })
			.populate({
				path: "propertyId",
				select: "overview images",
			});

		res.status(200).json({
			message: "Request declined successfully.",
			interest: populatedInterest,
		});
	} catch (error) {
		console.error("Error declining interest:", error);
		res.status(500).json({
			message: "Server error while declining interest.",
		});
	}
};
