const mongoose = require("mongoose");

const InterestSchema = new mongoose.Schema(
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
		renterId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
			maxlength: 2000,
		},
		moveInDate: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "declined", "withdrawn"],
			default: "pending",
			required: true,
		},
		streamChannelId: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

// Create a compound index to prevent duplicate requests from the same renter for the same property
InterestSchema.index({ propertyId: 1, renterId: 1 }, { unique: true });

const Interest = mongoose.model("Interest", InterestSchema);

module.exports = Interest;
