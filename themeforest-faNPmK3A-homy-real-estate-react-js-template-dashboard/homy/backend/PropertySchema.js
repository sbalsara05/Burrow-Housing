const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
   title: { type: String, required: true },
   description: { type: String, required: true },
   address: { type: String, required: true },
   location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
   },
   amenities: { type: [String], default: [] },
   files: { type: [String], default: [] },
   price: { type: String, required: true },
   propertyType: { type: String, required: true },
   bedrooms: { type: Number, required: true },
   bathrooms: { type: Number, required: true },
   size: { type: Number, required: true },
   isAvailable: { type: Boolean, default: true },
});