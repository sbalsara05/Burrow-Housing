// backend/queues/emailQueue.js
const Bull = require("bull");
const { getRedisClient } = require("../redis");
const { sendNotificationEmail } = require("../services/emailService");
const User = require("../models/userModel");

// Validate Redis URL
if (!process.env.REDIS_URL) {
	console.error(
		"[Email Queue] ERROR: REDIS_URL is not set in environment variables. Email notifications will not work."
	);
}

// Create the email queue
// Bull will use the Redis connection from REDIS_URL
const emailQueue = new Bull("email-notifications", {
	redis: process.env.REDIS_URL || {
		host: "127.0.0.1",
		port: 6379,
	},
	settings: {
		retryProcessDelay: 5000, // Wait 5 seconds before retrying failed jobs
	},
});

// Handle queue connection events
emailQueue.on("error", (error) => {
	console.error("[Email Queue] Queue error:", error);
});

emailQueue.on("waiting", (jobId) => {
	console.log(`[Email Queue] Job ${jobId} is waiting`);
});

emailQueue.on("active", (job) => {
	console.log(`[Email Queue] Job ${job.id} started processing`);
});

// Verify queue is ready
emailQueue
	.isReady()
	.then(() => {
		console.log("[Email Queue] Queue initialized and ready");
	})
	.catch((error) => {
		console.error("[Email Queue] Failed to initialize queue:", error);
	});

// Process email notification jobs
emailQueue.process("notification-email", async (job) => {
	const { userId, notificationType, notificationData } = job.data;

	console.log(
		`[Email Queue] Processing ${notificationType} email job ${job.id} for user ${userId}`
	);

	try {
		// Fetch user and check email notification preferences
		const user = await User.findById(userId).select(
			"email name emailNotifications"
		);

		if (!user) {
			console.warn(
				`[Email Queue] User ${userId} not found, skipping email notification`
			);
			return { skipped: true, reason: "User not found" };
		}

		console.log(
			`[Email Queue] Found user ${user.email} (ID: ${userId}), checking preferences...`
		);

		// Check if email notifications are enabled globally
		if (user.emailNotifications?.enabled === false) {
			console.log(
				`[Email Queue] Email notifications disabled globally for user ${userId} (${user.email})`
			);
			return { skipped: true, reason: "Email notifications disabled" };
		}

		// Default to enabled if not set (backward compatibility)
		if (user.emailNotifications?.enabled === undefined) {
			console.log(
				`[Email Queue] Email notifications not explicitly set for user ${userId}, defaulting to enabled`
			);
		}

		// Map notification types to preference keys
		const preferenceMap = {
			new_interest: "newInterest",
			interest_approved: "interestApproved",
			interest_declined: "interestDeclined",
			interest_withdrawn: "interestWithdrawn",
			new_message: "newMessage",
			property_deleted: "propertyDeleted",
			property_favorited: "propertyFavorited",
			ambassador_request: "ambassadorRequest",
			ambassador_request_update: "ambassadorRequestUpdate",
			ambassador_request_cancelled: "ambassadorRequestCancelled",
			contract_pending: "contractPending",
			contract_tenant_signed: "contractTenantSigned",
			contract_completed: "contractCompleted",
			contract_payment_received: "contractPaymentReceived",
			contract_cancelled: "contractCancelled",
		};

		const preferenceKey = preferenceMap[notificationType];
		if (
			preferenceKey &&
			user.emailNotifications?.[preferenceKey] === false
		) {
			console.log(
				`[Email Queue] Email notification type ${notificationType} disabled for user ${userId} (preference: ${preferenceKey})`
			);
			return {
				skipped: true,
				reason: `Notification type ${notificationType} disabled`,
			};
		}

		console.log(
			`[Email Queue] Sending ${notificationType} email to ${user.email}...`
		);

		// Send the email
		await sendNotificationEmail(
			user.email,
			user.name,
			notificationType,
			notificationData
		);

		console.log(
			`[Email Queue] ✓ Successfully sent ${notificationType} email to ${user.email}`
		);
		return { success: true, email: user.email };
	} catch (error) {
		console.error(
			`[Email Queue] ✗ Error processing email notification for user ${userId}:`,
			error.message || error
		);
		console.error(`[Email Queue] Full error:`, error);
		// Re-throw to mark job as failed (Bull will retry based on settings)
		throw error;
	}
});

// Handle job completion
emailQueue.on("completed", (job, result) => {
	console.log(
		`[Email Queue] ✓ Job ${job.id} completed`,
		result?.skipped
			? `(skipped: ${result.reason})`
			: `(email sent to ${result?.email || "unknown"})`
	);
});

// Handle job failure
emailQueue.on("failed", (job, err) => {
	console.error(`[Email Queue] ✗ Job ${job.id} failed:`, err.message);
	console.error(`[Email Queue] Error details:`, {
		userId: job.data.userId,
		notificationType: job.data.notificationType,
		attemptsMade: job.attemptsMade,
		error: err.message,
	});
});

// Clean up old completed jobs (keep last 100)
emailQueue.on("cleaned", (jobs, type) => {
	console.log(`[Email Queue] Cleaned ${jobs.length} ${type} jobs`);
});

// Clean old jobs every hour
setInterval(async () => {
	try {
		await emailQueue.clean(24 * 60 * 60 * 1000, "completed", 100); // Keep last 100 completed jobs from last 24h
		await emailQueue.clean(7 * 24 * 60 * 60 * 1000, "failed", 50); // Keep last 50 failed jobs from last 7 days
	} catch (error) {
		console.error("[Email Queue] Error cleaning old jobs:", error);
	}
}, 60 * 60 * 1000); // Every hour

module.exports = { emailQueue };
