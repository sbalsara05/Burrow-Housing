
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  overview: {
    category: {
      type: String,
      enum: ["Single Room", "Apartment"],
      required: true
    },
    neighborhood: {
      type: String,
      enum: [
        "Any", "Allston", "Back Bay", "Beacon Hill", "Brighton", "Charlestown", 
        "Chinatown", "Dorchester", "Fenway", "Hyde Park", "Jamaica Plain", 
        "Mattapan", "Mission Hill", "North End", "Roslindale", "Roxbury", 
        "South Boston", "South End", "West End", "West Roxbury", "Wharf District"
      ],
      required: true
    },
    Rent: { type: Number, required: true },
  },
  listingDetails: {
    sqft: {type: Number, required: true },
    bedrooms: {type: Number, enum: [1, 2, 3, 4, 5], required: true },
    bathrooms: {type: Number, enum: [1, 2, 3], required: true },
    floorNo: {type: Number, enum: [0, 1, 2,3 ], required: true },
  },
  amenities: {
    type: [String],
    enum: [
      "A/C & Heating",
      "Balcony",
      "Driveway",
      "Disabled Access",
      "Refrigerator",
      "Wifi",
      "Washer & Dryer",
      "Lawn"
    ],
  },
  addressAndLocation: {
    address: {type: String, required: true},
    // Add coordinate fields
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    coordinateSource: { type: String }, // 'geocoded-google', 'geocoded-nominatim', 'neighborhood-fallback'
    lastGeocoded: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update `updatedAt` field on save
PropertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', PropertySchema);