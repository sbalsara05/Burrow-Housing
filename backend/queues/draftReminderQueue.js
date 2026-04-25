// backend/queues/draftReminderQueue.js
const Bull = require("bull");
const PropertyDraft = require("../models/propertyDraftModel");
const Notification = require("../models/notificationModel");
const { emailQueue } = require("./emailQueue");

const REMINDER_DELAY_MS = 36 * 60 * 60 * 1000; // 36 hours

// Reuse the same Redis connection helper as emailQueue
function getBullRedisOptions() {
	const redisUrl = process.env.REDIS_URL;
	if (!redisUrl) {
		return { host: "127.0.0.1", port: 6379 };
	}
	try {
		const u = new URL(redisUrl);
		const options = {
			host: u.hostname,
			port: parseInt(u.port || "6379", 10),
			retryStrategy(times) {
				const delay = Math.min(times * 100, 3000);
				console.log(
					`[Draft Reminder Queue] Redis reconnect in ${delay}ms (attempt ${times})`
				);
				return delay;
			},
			keepAlive: 30000,
		};
		if (u.password) options.password = u.password;
		if (u.pathname && u.pathname.length > 1) {
			const db = parseInt(u.pathname.slice(1), 10);
			if (!Number.isNaN(db)) options.db = db;
		}
		return options;
	} catch (e) {
		console.warn(
			"[Draft Reminder Queue] Invalid REDIS_URL, using default:",
			e.message
		);
		return { host: "127.0.0.1", port: 6379 };
	}
}

const draftReminderQueue = new Bull("draft-reminders", {
	redis: getBullRedisOptions(),
});

draftReminderQueue.on("error", (error) => {
	console.error("[Draft Reminder Queue] Queue error:", error);
});

draftReminderQueue
	.isReady()
	.then(() => {
		console.log("[Draft Reminder Queue] Queue initialized and ready");
	})
	.catch((error) => {
		console.error(
			"[Draft Reminder Queue] Failed to initialize queue:",
			error
		);
	});

// Worker: fires 36 hours after draft creation
draftReminderQueue.process("draft-reminder", async (job) => {
	const { draftId, userId } = job.data;

	console.log(
		`[Draft Reminder Queue] Processing reminder for draft ${draftId} (user ${userId})`
	);

	const draft = await PropertyDraft.findOne({ _id: draftId, userId });

	if (!draft) {
		console.log(
			`[Draft Reminder Queue] Draft ${draftId} no longer exists — property was likely published. Skipping.`
		);
		return { skipped: true, reason: "Draft not found (already published)" };
	}

	if (draft.reminderSent) {
		console.log(
			`[Draft Reminder Queue] Reminder already sent for draft ${draftId}. Skipping.`
		);
		return { skipped: true, reason: "Reminder already sent" };
	}

	// Create in-app notification
	try {
		await Notification.create({
			userId,
			type: "draft_reminder",
			message:
				"You have an unfinished property listing. Complete it to start getting sublease inquiries!",
			link: "/dashboard/add-property",
			metadata: {},
		});
		console.log(
			`[Draft Reminder Queue] In-app notification created for user ${userId}`
		);
	} catch (notifError) {
		// Don't fail the job if in-app notification fails; still send email
		console.error(
			"[Draft Reminder Queue] Error creating in-app notification:",
			notifError.message
		);
	}

	// Queue email notification
	try {
		await emailQueue.add(
			"notification-email",
			{
				userId,
				notificationType: "draft_reminder",
				notificationData: {
					message:
						"You started listing a property on Burrow Housing but haven't finished yet. Complete your listing to start getting sublease inquiries!",
					link: "/dashboard/add-property",
				},
			},
			{
				attempts: 3,
				backoff: { type: "exponential", delay: 2000 },
				removeOnComplete: true,
				removeOnFail: false,
			}
		);
		console.log(
			`[Draft Reminder Queue] Email notification queued for user ${userId}`
		);
	} catch (emailError) {
		console.error(
			"[Draft Reminder Queue] Error queuing email notification:",
			emailError.message
		);
	}

	// Mark reminder as sent
	draft.reminderSent = true;
	await draft.save();

	return { success: true, draftId, userId };
});

draftReminderQueue.on("completed", (job, result) => {
	console.log(
		`[Draft Reminder Queue] ✓ Job ${job.id} completed`,
		result?.skipped ? `(skipped: ${result.reason})` : "(reminder sent)"
	);
});

draftReminderQueue.on("failed", (job, err) => {
	console.error(
		`[Draft Reminder Queue] ✗ Job ${job.id} failed:`,
		err.message
	);
});

/**
 * Schedule a 36-hour reminder for a newly created draft.
 * Returns the Bull job ID (string) to be stored on the draft document.
 */
async function scheduleDraftReminder(draftId, userId) {
	const job = await draftReminderQueue.add(
		"draft-reminder",
		{ draftId: draftId.toString(), userId: userId.toString() },
		{
			delay: REMINDER_DELAY_MS,
			attempts: 3,
			backoff: { type: "exponential", delay: 5000 },
			removeOnComplete: true,
			removeOnFail: false,
		}
	);
	console.log(
		`[Draft Reminder Queue] Scheduled reminder job ${job.id} for draft ${draftId} (fires in 36h)`
	);
	return job.id.toString();
}

/**
 * Cancel the reminder job for a draft (call when property is published or draft is deleted).
 */
async function cancelDraftReminder(reminderJobId) {
	if (!reminderJobId) return;
	try {
		const job = await draftReminderQueue.getJob(reminderJobId);
		if (job) {
			await job.remove();
			console.log(
				`[Draft Reminder Queue] Cancelled reminder job ${reminderJobId}`
			);
		}
	} catch (err) {
		console.warn(
			`[Draft Reminder Queue] Could not cancel job ${reminderJobId}:`,
			err.message
		);
	}
}

module.exports = { draftReminderQueue, scheduleDraftReminder, cancelDraftReminder };
