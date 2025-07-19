const Notification = require("../models/notificationModel");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
	const userId = req.user.userId;
	try {
		const notifications = await Notification.find({ userId })
			.sort({ createdAt: -1 })
			.limit(20); // Limit to the 20 most recent notifications

		res.status(200).json(notifications);
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
