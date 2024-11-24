const mongoose = require('mongoose');
const propertySchema = {
   title: "", // Title of the property
   description: "", // Brief description of the property
   address: "", // Full address
   location: {
      lat: 0, // Latitude
      lng: 0, // Longitude
   },
   amenities: [], // List of selected amenities
   files: [], // Array of uploaded photos and videos
   price: "", // Property price
   propertyType: "", // E.g., Apartment, House
   bedrooms: 0, // Number of bedrooms
   bathrooms: 0, // Number of bathrooms
   size: 0, // Size in square feet
   isAvailable: true, // Availability status
};
