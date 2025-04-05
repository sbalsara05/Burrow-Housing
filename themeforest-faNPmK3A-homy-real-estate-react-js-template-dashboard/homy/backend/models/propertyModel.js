const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	}, // Reference to the User schema
	overview: {
		category: {
			type: String,
			enum: ["Single Room", "Apartment"],
			required: true,
		},
        roomType: {
			type: String,
			enum: ["Shared Room", "Single Room"],
			required: true,
		},
		neighborhood: {
			type: String,
			enum: [
				"Any",
				"Allston",
				"Back Bay",
				"Beacon Hill",
				"Brighton",
				"Charlestown",
				"Chinatown",
				"Dorchester",
				"Fenway",
				"Hyde Park",
				"Jamaica Plain",
				"Mattapan",
				"Mission Hill",
				"North End",
				"Roslindale",
				"Roxbury",
				"South Boston",
				"South End",
				"West End",
				"West Roxbury",
				"Wharf District",
			],
			required: true,
		},
		rent: { type: Number, required: true },
	},
	listingDetails: {
		size: { type: Number, required: false },
		bedrooms: {
			type: Number,
			enum: [1, 2, 3, 4, 5],
			required: true,
		},
		bathrooms: { type: Number, enum: [1, 2, 3], required: true },
		floorNo: { type: Number, required: true },
	},
	amenities: {
		type: "array",
		items: {
			type: "string",
			enum: [
				"A/C & Heating",
				"Balcony",
				"Driveway",
				"Disabled Access",
				"Refrigerator",
				"Wifi",
				"Washer & Dryer",
				"Lawn",
			],
		},
	},

	addressAndLocation: {
		address: { type: String, required: true },
	},
	buildingName: { type: String, required: false },
    leaseLength: { type: String, required: true},
    description: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const Property = mongoose.model("Property", PropertySchema);

module.exports = Property;
