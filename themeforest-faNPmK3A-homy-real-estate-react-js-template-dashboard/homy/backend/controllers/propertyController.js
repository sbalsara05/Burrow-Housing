const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// controllers/propertyController.js

const User = require('../models/userModel'); // Mongoose User model

/**
 * Controller to get the properties of a user
 */
exports.getMyProperties = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from the token
        console.log('Fetching properties for user ID: ', userId);

        // Fetch the user's properties
        // const user = await User.findById(userId).select('properties'); // Assuming 'properties' is a field in the User model

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has properties
        if (!user.properties || user.properties.length === 0) {
            return res.status(200).json({ message: 'No properties found for this user', properties: [] });
        }

        res.status(200).json({
            message: 'Properties retrieved successfully',
            properties: user.properties,
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


/**
 * Controller to add a new property for a user
 */
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

// Create the Property model
const Property = mongoose.model('Property', propertySchema);

// Define the function to add a new property
exports.addNewProperty = async (req, res) => {
    const {
        title,
        description,
        address,
        location,
        amenities,
        files,
        price,
        propertyType,
        bedrooms,
        bathrooms,
        size,
    } = req.body; // Extract property data from the request body
    const userId = req.user.userId; // Extract user ID from the authenticated token

    try {
        // Validate input
        if (!title || !description || !address || !location || !price || !propertyType || bedrooms === undefined || bathrooms === undefined || size === undefined) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`Adding property '${title}' for user ${userId}`);

        // Create a new property document
        const newProperty = new Property({
            title,
            description,
            address,
            location,
            amenities: amenities || [], // Default to empty array if not provided
            files: files || [], // Default to empty array if not provided
            price,
            propertyType,
            bedrooms,
            bathrooms,
            size,
        });

        // Save the new property document to the database
        const savedProperty = await newProperty.save();

        // Associate the property with the user
        if (!Array.isArray(user.properties)) {
            user.properties = []; // Initialize properties array if undefined
        }

        user.properties.push(savedProperty._id); // Store the property ID in the user's properties
        await user.save();

        // Respond with success
        res.status(201).json({
            message: "Property added successfully",
            property: savedProperty,
        });
    } catch (error) {
        console.error("Error adding property: ", error);
        res.status(500).json({ message: "Server error while adding property" });
    }
};
