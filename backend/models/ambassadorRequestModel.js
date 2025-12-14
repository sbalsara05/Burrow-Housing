const mongoose = require("mongoose");

const AmbassadorRequestSchema = new mongoose.Schema(
	{
		propertyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property",
			required: true,
			index: true,
		},
		listerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		requesterId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		inspectionPoints: [
			{
				text: {
					type: String,
					required: true,
					trim: true,
				},
				details: {
					type: String,
					trim: true,
					default: "",
				},
			},
		],
		preferredDates: {
			type: String,
			required: true,
			trim: true,
		},
		contactInfo: {
			type: String,
			trim: true,
		}, // Optional - kept for backward compatibility
		review: {
			text: {
				type: String,
				trim: true,
			},
			images: [{
				type: String, // URLs to uploaded images
			}],
			submittedAt: {
				type: Date,
			},
		},
		status: {
			type: String,
			enum: ["pending", "approved", "declined", "completed", "cancelled", "assigned"],
			default: "pending",
			required: true,
		},
		ambassadorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			index: true,
		}, // Assigned ambassador
		scheduledDate: {
			type: Date,
		}, // Scheduled inspection date/time
		propertyTitle: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

// Create a compound index to prevent duplicate requests from the same requester for the same property
AmbassadorRequestSchema.index({ propertyId: 1, requesterId: 1 }, { unique: true });

const AmbassadorRequest = mongoose.model("AmbassadorRequest", AmbassadorRequestSchema);

module.exports = AmbassadorRequest;
