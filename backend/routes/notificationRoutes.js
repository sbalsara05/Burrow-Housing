const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
	getNotifications,
	markNotificationsAsRead,
} = require("../controllers/notificationController");

router.get("/notifications", authenticateToken, getNotifications);
router.post("/notifications/read", authenticateToken, markNotificationsAsRead);

module.exports = router;
