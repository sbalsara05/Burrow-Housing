// backend/controllers/draftController.js
const PropertyDraft = require("../models/propertyDraftModel");
const {
	scheduleDraftReminder,
	cancelDraftReminder,
} = require("../queues/draftReminderQueue");

/**
 * POST /api/drafts
 * Create a new draft or update an existing one.
 * Body: { draftId?, propertyType, overview, listingDetails, amenities,
 *         addressAndLocation, buildingName, leaseLength, description }
 */
exports.saveDraft = async (req, res) => {
	try {
		const userId = req.user.userId;
		const { draftId, ...draftData } = req.body;

		if (draftId) {
			// Update existing draft
			const draft = await PropertyDraft.findOneAndUpdate(
				{ _id: draftId, userId },
				{ $set: draftData },
				{ new: true, runValidators: false }
			);

			if (!draft) {
				return res
					.status(404)
					.json({ message: "Draft not found." });
			}

			return res.json({ draft });
		}

		// Create new draft
		const draft = new PropertyDraft({ userId, ...draftData });
		await draft.save();

		// Schedule the 36-hour reminder
		try {
			const jobId = await scheduleDraftReminder(
				draft._id,
				userId
			);
			draft.reminderJobId = jobId;
			await draft.save();
		} catch (queueErr) {
			console.error(
				"[Draft Controller] Failed to schedule reminder:",
				queueErr.message
			);
			// Non-fatal — draft is still saved
		}

		return res.status(201).json({ draft });
	} catch (error) {
		console.error("[Draft Controller] saveDraft error:", error);
		res.status(500).json({ message: "Failed to save draft." });
	}
};

/**
 * GET /api/drafts
 * Return all drafts belonging to the authenticated user, newest first.
 */
exports.getMyDrafts = async (req, res) => {
	try {
		const userId = req.user.userId;
		const drafts = await PropertyDraft.find({ userId }).sort({
			updatedAt: -1,
		});
		res.json({ drafts });
	} catch (error) {
		console.error("[Draft Controller] getMyDrafts error:", error);
		res.status(500).json({ message: "Failed to fetch drafts." });
	}
};

/**
 * GET /api/drafts/:id
 * Return a single draft (ownership-checked).
 */
exports.getDraftById = async (req, res) => {
	try {
		const userId = req.user.userId;
		const draft = await PropertyDraft.findOne({
			_id: req.params.id,
			userId,
		});
		if (!draft) {
			return res.status(404).json({ message: "Draft not found." });
		}
		res.json({ draft });
	} catch (error) {
		console.error("[Draft Controller] getDraftById error:", error);
		res.status(500).json({ message: "Failed to fetch draft." });
	}
};

/**
 * DELETE /api/drafts/:id
 * Delete a draft and cancel its pending reminder job.
 * Called automatically when a property is successfully published.
 */
exports.deleteDraft = async (req, res) => {
	try {
		const userId = req.user.userId;
		const draft = await PropertyDraft.findOneAndDelete({
			_id: req.params.id,
			userId,
		});

		if (!draft) {
			return res.status(404).json({ message: "Draft not found." });
		}

		await cancelDraftReminder(draft.reminderJobId);

		res.json({ message: "Draft deleted." });
	} catch (error) {
		console.error("[Draft Controller] deleteDraft error:", error);
		res.status(500).json({ message: "Failed to delete draft." });
	}
};
