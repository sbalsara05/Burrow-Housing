const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// controllers/propertyController.js

const User = require('../models/userModel'); // User model

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

// Define the function to add a new property
exports.addNewProperty = async (req, res) => {
  const {
    overview, // Overview should include category, neighborhood, totalRent, avgRentPerPerson
  } = req.body; // Extract property data from the request body
  const userId = req.user.userId; // Extract user ID from the authenticated token

  try {
    // Validate input
    if (!overview || !overview.category || !overview.neighborhood || !overview.totalRent || !overview.avgRentPerPerson) {
      return res.status(400).json({ message: "All required fields in the overview must be provided" });
    }

    // Validate `overview.category` and `overview.neighborhood`
    const validCategories = ["Single Room", "Apartment"];
    const validNeighborhoods = [
      "Any", "Allston", "Back Bay", "Beacon Hill", "Brighton", "Charlestown",
      "Chinatown", "Dorchester", "Fenway", "Hyde Park", "Jamaica Plain",
      "Mattapan", "Mission Hill", "North End", "Roslindale", "Roxbury",
      "South Boston", "South End", "West End", "West Roxbury", "Wharf District"
    ];

    if (!validCategories.includes(overview.category)) {
      return res.status(400).json({ message: "Invalid category in overview" });
    }

    if (!validNeighborhoods.includes(overview.neighborhood)) {
      return res.status(400).json({ message: "Invalid neighborhood in overview" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Adding property for user ${userId}`);

    // Create a new property document
    const newProperty = new Property({
      overview,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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