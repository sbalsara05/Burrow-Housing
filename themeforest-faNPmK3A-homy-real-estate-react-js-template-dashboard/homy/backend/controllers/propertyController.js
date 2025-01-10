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
        const user = await User.findById(userId).select('properties'); // Assuming 'properties' is a field in the User model

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
exports.addNewProperty = async (req, res) => {
    const { propertyName, propertyDetails } = req.body; // Extract property data from the request body
    const userId = req.user.userId; // Extract user ID from the authenticated token

    try {
        // Validate input
        if (!propertyName || !propertyDetails) {
            return res.status(400).json({ message: "Property name and details are required" });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`Adding property '${propertyName}' for user ${userId}`);

        // Add the new property
        const newProperty = {
            name: propertyName,
            details: propertyDetails,
        };

        if (!Array.isArray(user.properties)) {
            user.properties = []; // Initialize properties array if undefined
        }

        user.properties.push(newProperty); // Append the new property

        // Save the updated user document
        await user.save();

        // Respond with success
        res.status(201).json({
            message: "Property added successfully",
            property: newProperty,
        });
    } catch (error) {
        console.error("Error adding property: ", error);
        res.status(500).json({ message: "Server error while adding property" });
    }
};