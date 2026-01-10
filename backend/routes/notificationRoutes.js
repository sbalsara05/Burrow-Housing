const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
	getNotifications,
	markNotificationsAsRead,
    deleteNotification,
    clearReadNotifications,
	testEmailNotification,
} = require("../controllers/notificationController");

router.get("/notifications", authenticateToken, getNotifications);

router.post("/notifications/read", authenticateToken, markNotificationsAsRead);
router.post('/notifications/clear-read', authenticateToken, clearReadNotifications);
router.post('/notifications/test-email', authenticateToken, testEmailNotification);

router.delete('/notifications/:notificationId', authenticateToken, deleteNotification);

module.exports = router;
