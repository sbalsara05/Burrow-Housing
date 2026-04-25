const mongoose = require("mongoose");

// Mirrors the property form shape — all fields optional so any partial draft can be saved
const PropertyDraftSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		// UI toggle value ('Apartment' | 'Room')
		propertyType: { type: String },
		overview: {
			title: { type: String },
			category: { type: String },
			roomType: { type: String },
			neighborhood: { type: String },
			rent: { type: Number },
		},
		listingDetails: {
			size: { type: Number },
			bedrooms: { type: Number },
			bathrooms: { type: Number },
			floorNo: { type: Number },
		},
		amenities: [{ type: String }],
		addressAndLocation: {
			address: { type: String },
			line1: { type: String },
			line2: { type: String },
			city: { type: String },
			state: { type: String },
			zip: { type: String },
			location: {
				lat: { type: Number },
				lng: { type: Number },
			},
		},
		buildingName: { type: String },
		leaseLength: { type: String },
		description: { type: String },
		// Stored image URLs (carry over from any previously uploaded images)
		images: [{ type: String }],

		// Reminder tracking
		reminderSent: { type: Boolean, default: false },
		reminderJobId: { type: String }, // Bull job ID — used to cancel on publish
	},
	{ timestamps: true }
);

const PropertyDraft = mongoose.model("PropertyDraft", PropertyDraftSchema);

module.exports = PropertyDraft;
