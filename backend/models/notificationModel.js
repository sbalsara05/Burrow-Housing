const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
	{
		userId: {
			// The user who RECEIVES the notification
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		type: {
			type: String,
			enum: [
				"new_interest",
				"interest_approved",
				"interest_declined",
				"new_message", // For future Stream webhook integration
				"property_favorited", // For optional future features
			],
			required: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
			maxlength: 500,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		link: {
			// The frontend URL to navigate to
			type: String,
			required: true,
		},
		metadata: {
			// Store relevant IDs for context, e.g., who initiated the action
			propertyId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Property",
			},
			renterId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			listerId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		},
	},
	{ timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
