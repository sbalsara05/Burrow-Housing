const Notification = require("../models/notificationModel");

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
