// backend/utils/notificationEmailHelper.js
const { emailQueue } = require("../queues/emailQueue");

/**
 * Queues an email notification to be sent when a notification is created.
 * This function is non-blocking and will not throw errors to avoid breaking
 * the main notification creation flow.
 *
 * @param {string} userId - The ID of the user who should receive the email.
 * @param {string} notificationType - The type of notification (e.g., 'new_interest', 'new_message').
 * @param {object} notificationData - The notification data (message, link, metadata, etc.).
 */
const queueNotificationEmail = async (userId, notificationType, notificationData) => {
	try {
		// Add job to the email queue
		await emailQueue.add(
			"notification-email",
			{
				userId,
				notificationType,
				notificationData,
			},
			{
				attempts: 3, // Retry up to 3 times if it fails
				backoff: {
					type: "exponential",
					delay: 2000, // Start with 2 second delay
				},
				removeOnComplete: true, // Remove completed jobs to save memory
				removeOnFail: false, // Keep failed jobs for debugging
			}
		);

		console.log(
			`[Notification Email Helper] Queued ${notificationType} email for user ${userId}`
		);
	} catch (error) {
		// Log error but don't throw - we don't want email failures to break notification creation
		console.error(
			`[Notification Email Helper] Error queueing email for user ${userId}:`,
			error
		);
	}
};

/**
 * Queues email notifications for multiple users (e.g., when notifying all ambassadors).
 * @param {Array<string>} userIds - Array of user IDs who should receive the email.
 * @param {string} notificationType - The type of notification.
 * @param {object} notificationData - The notification data.
 */
const queueBulkNotificationEmails = async (userIds, notificationType, notificationData) => {
	if (!Array.isArray(userIds) || userIds.length === 0) {
		return;
	}

	const queuePromises = userIds.map((userId) =>
		queueNotificationEmail(userId, notificationType, notificationData)
	);

	try {
		await Promise.all(queuePromises);
		console.log(
			`[Notification Email Helper] Queued ${userIds.length} ${notificationType} emails`
		);
	} catch (error) {
		console.error(
			`[Notification Email Helper] Error queueing bulk emails:`,
			error
		);
	}
};

module.exports = {
	queueNotificationEmail,
	queueBulkNotificationEmails,
};
