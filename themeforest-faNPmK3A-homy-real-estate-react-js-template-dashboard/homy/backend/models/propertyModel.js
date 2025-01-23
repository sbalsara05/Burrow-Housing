const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
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
    totalRent: { type: Number, required: true },
    avgRentPerPerson: { type: Number, required: true },
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
