const Notification = require("../models/notificationModel");
const { queueNotificationEmail } = require("../utils/notificationEmailHelper");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
	const userId = req.user.userId;
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 15;
	const skip = (page - 1) * limit;

	try {
		const notifications = await Notification.find({ userId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Notification.countDocuments({ userId });

		res.status(200).json({
			notifications,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(total / limit),
				totalItems: total,
			},
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res.status(500).json({
			message: "Server error while fetching notifications.",
		});
	}
};

// POST /api/notifications/read
exports.markNotificationsAsRead = async (req, res) => {
	const userId = req.user.userId;
	try {
		await Notification.updateMany(
			{ userId: userId, isRead: false },
			{ $set: { isRead: true } }
		);
		res.status(200).json({
			message: "All notifications marked as read.",
		});
	} catch (error) {
		console.error("Error marking notifications as read:", error);
		res.status(500).json({
			message: "Server error while marking notifications as read.",
		});
	}
};

// DELETE /api/notifications/:notificationId
exports.deleteNotification = async (req, res) => {
	const userId = req.user.userId;
	const { notificationId } = req.params;
	try {
		const result = await Notification.findOneAndDelete({
			_id: notificationId,
			userId,
		});
		if (!result) {
			return res
				.status(404)
				.json({
					message: "Notification not found or you do not have permission to delete it.",
				});
		}
		res.status(200).json({ message: "Notification deleted." });
	} catch (error) {
		console.error("Error deleting notification:", error);
		res.status(500).json({ message: "Server error." });
	}
};

// POST /api/notifications/clear-read
exports.clearReadNotifications = async (req, res) => {
	const userId = req.user.userId;
	try {
		await Notification.deleteMany({ userId: userId, isRead: true });
		res.status(200).json({
			message: "Read notifications cleared.",
		});
	} catch (error) {
		console.error("Error clearing read notifications:", error);
		res.status(500).json({ message: "Server error." });
	}
};

// POST /api/notifications/test-email (for testing email notifications)
exports.testEmailNotification = async (req, res) => {
	const userId = req.user.userId;
	const { notificationType } = req.body;

	// Allowed notification types for testing
	const allowedTypes = [
		"new_interest",
		"interest_approved",
		"interest_declined",
		"interest_withdrawn",
		"new_message",
		"property_deleted",
		"property_favorited",
		"ambassador_request",
		"ambassador_request_update",
		"ambassador_request_cancelled",
	];

	const type = notificationType || "new_interest";

	if (!allowedTypes.includes(type)) {
		return res.status(400).json({
			message: `Invalid notification type. Allowed types: ${allowedTypes.join(", ")}`,
		});
	}

	try {
		// Create a test notification in the database
		const testMessage =
			type === "new_interest"
				? "Test User sent an inquiry for 'Test Property'."
				: type === "interest_approved"
				? "Your request for 'Test Property' was approved!"
				: type === "ambassador_request"
				? "Test User requested an ambassador viewing for 'Test Property'."
				: `This is a test ${type} notification.`;

		const testNotification = new Notification({
			userId: userId,
			type: type,
			message: testMessage,
			link: "/dashboard/notifications",
			metadata: {
				propertyId: null,
				test: true,
			},
		});
		await testNotification.save();

		// Queue the email
		await queueNotificationEmail(userId, type, {
			message: testMessage,
			link: "/dashboard/notifications",
			metadata: {
				propertyId: null,
				test: true,
			},
		});

		res.status(200).json({
			message: `Test ${type} notification created and email queued successfully.`,
			notificationId: testNotification._id,
			notificationType: type,
			note: "Check your email and server logs for delivery status.",
		});
	} catch (error) {
		console.error("Error creating test notification:", error);
		res.status(500).json({
			message: "Server error while creating test notification.",
			error: error.message,
		});
	}
};
