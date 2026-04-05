const mongoose = require("mongoose");
const { getStreamClient } = require("../services/streamService");
const Notification = require("../models/notificationModel");
const Interest = require("../models/interestModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const { queueNotificationEmail } = require("../utils/notificationEmailHelper");

/**
 * Stream Chat webhook: POST with raw JSON body (must be mounted with express.raw).
 * Configure in Stream Dashboard → Chat → Webhooks → URL: {API}/api/stream/webhook
 * Event types: message.new
 */
exports.handleStreamWebhook = async (req, res) => {
	let client;
	try {
		client = getStreamClient();
	} catch (err) {
		console.error("[Stream Webhook] Stream client unavailable:", err.message);
		return res.status(503).json({ message: "Chat service unavailable." });
	}

	const rawBody = req.body;
	const xSignature = req.headers["x-signature"];
	if (!rawBody || !xSignature || !client.verifyWebhook(rawBody, xSignature)) {
		console.warn("[Stream Webhook] Invalid or missing signature");
		return res.status(401).json({ message: "Invalid signature." });
	}

	let payload;
	try {
		payload = JSON.parse(
			Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody)
		);
	} catch (e) {
		return res.status(400).json({ message: "Invalid JSON." });
	}

	if (payload.type !== "message.new") {
		return res.status(200).json({ received: true });
	}

	const message = payload.message;
	if (!message || message.silent) {
		return res.status(200).json({ received: true });
	}

	if (message.type === "deleted" || message.type === "ephemeral") {
		return res.status(200).json({ received: true });
	}

	const senderId = message.user?.id;
	if (!senderId) {
		return res.status(200).json({ received: true });
	}

	let channelId = payload.channel_id || "";
	if (!channelId && payload.cid) {
		const parts = String(payload.cid).split(":");
		if (parts.length >= 2) channelId = parts[1];
	}
	const interestMatch = channelId.match(/^interest-([a-f0-9]{24})$/i);
	if (!interestMatch) {
		return res.status(200).json({ received: true });
	}

	const interestId = interestMatch[1];
	if (!mongoose.Types.ObjectId.isValid(interestId)) {
		return res.status(200).json({ received: true });
	}

	const text = (message.text || "").trim();
	const hasAttachments = Array.isArray(message.attachments) && message.attachments.length > 0;
	if (!text && !hasAttachments) {
		return res.status(200).json({ received: true });
	}

	// Stable id for dedupe + unique index: never pass undefined into queries (Mongoose strips
	// undefined keys, which would match any prior new_message for that user).
	const rawMsgId = message.id != null ? String(message.id).trim() : "";
	const streamMessageId =
		rawMsgId ||
		(message.created_at && channelId
			? `ts:${channelId}:${message.created_at}`
			: "");

	try {
		const interest = await Interest.findById(interestId).lean();
		if (!interest) {
			return res.status(200).json({ received: true });
		}

		const lister = interest.listerId.toString();
		const renter = interest.renterId.toString();
		const members = Array.isArray(payload.members) ? payload.members : [];

		let recipientId = null;
		if (senderId === lister) recipientId = renter;
		else if (senderId === renter) recipientId = lister;

		let recipientMuted = false;
		if (recipientId) {
			const m = members.find(
				(mem) => (mem.user_id || mem.user?.id) === recipientId
			);
			if (m) recipientMuted = m.notifications_muted === true;
		} else {
			for (const mem of members) {
				const uid = mem.user_id || mem.user?.id;
				if (!uid || uid === senderId) continue;
				recipientId = uid;
				recipientMuted = mem.notifications_muted === true;
				break;
			}
		}

		if (!recipientId || recipientId === senderId) {
			return res.status(200).json({ received: true });
		}

		if (recipientMuted) {
			return res.status(200).json({ received: true });
		}

		if (streamMessageId) {
			const existing = await Notification.findOne({
				userId: recipientId,
				type: "new_message",
				"metadata.streamMessageId": streamMessageId,
			}).lean();
			if (existing) {
				return res.status(200).json({ received: true });
			}
		}

		const [sender, property] = await Promise.all([
			User.findById(senderId).select("name").lean(),
			Property.findById(interest.propertyId).select("overview.title").lean(),
		]);

		const senderName = (sender && sender.name) || "Someone";
		const propertyTitle =
			(property && property.overview && property.overview.title) ||
			"your conversation";

		let bodyLine;
		if (!text && hasAttachments) {
			bodyLine = `${senderName} sent an attachment.`;
		} else if (text) {
			const clipped = text.length > 350 ? `${text.slice(0, 350)}…` : text;
			bodyLine = `${senderName}: ${clipped}`;
		} else {
			bodyLine = `${senderName} sent a message.`;
		}

		const notificationMessage = `${bodyLine} — ${propertyTitle}`.slice(0, 500);

		const chatLink = `/dashboard/chat?channel=${encodeURIComponent(channelId)}`;

		const newNotification = new Notification({
			userId: recipientId,
			type: "new_message",
			message: notificationMessage,
			link: chatLink,
			metadata: {
				propertyId: interest.propertyId,
				renterId: interest.renterId,
				listerId: interest.listerId,
				...(streamMessageId && { streamMessageId }),
			},
		});
		await newNotification.save();

		await queueNotificationEmail(recipientId, "new_message", {
			message: notificationMessage,
			link: chatLink,
			metadata: {
				propertyId: interest.propertyId,
				renterId: interest.renterId,
				listerId: interest.listerId,
			},
		});
	} catch (err) {
		if (err && err.code === 11000) {
			return res.status(200).json({ received: true });
		}
		console.error("[Stream Webhook] Error handling message.new:", err);
		return res.status(500).json({ message: "Processing failed." });
	}

	return res.status(200).json({ received: true });
};
