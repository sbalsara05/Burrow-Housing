const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phone: {
			type: String,
			required: true, // Optional, set to `true` if you want to make it mandatory
			match: [
				/^\+?[1-9]\d{1,14}$/,
				"Please enter a valid phone number",
			], // E.164 format
			unique: true,
		},
		isVerified: { type: Boolean, default: false }, // Email verification status
		isAmbassador: { type: Boolean, default: false }, // Ambassador role flag
		ambassadorStatus: {
			type: String,
			enum: ["pending", "active", "inactive"],
			default: "pending",
		}, // Ambassador status
		ambassadorProfile: {
			bio: { type: String, default: "" },
			availableHours: [{ type: String }], // Array of available time slots
			completedInspections: { type: Number, default: 0 },
			rating: { type: Number, default: 0 },
			certificationDate: { type: Date },
		},
		properties: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Property",
			},
		], // Array of property IDs
		favorites: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Property",
			},
		], // Array of favorite property IDs
		emailNotifications: {
			enabled: { type: Boolean, default: true },
			newInterest: { type: Boolean, default: true },
			interestApproved: { type: Boolean, default: true },
			interestDeclined: { type: Boolean, default: true },
			interestWithdrawn: { type: Boolean, default: true },
			newMessage: { type: Boolean, default: true },
			propertyDeleted: { type: Boolean, default: true },
			propertyFavorited: { type: Boolean, default: true },
			ambassadorRequest: { type: Boolean, default: true },
			ambassadorRequestUpdate: { type: Boolean, default: true },
			ambassadorRequestCancelled: { type: Boolean, default: true },
		},
	},
	{ timestamps: true }
);

// Create the user model
const User = mongoose.model("User", userSchema);

module.exports = User;
