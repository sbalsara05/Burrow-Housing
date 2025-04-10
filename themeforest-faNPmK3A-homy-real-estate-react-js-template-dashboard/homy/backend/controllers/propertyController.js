const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Property = require("../models/propertyModel");

// controllers/propertyController.js

const User = require("../models/userModel"); // User model
const { json } = require("stream/consumers");

/**
 * Controller to get the properties of a user
 */
exports.getMyProperties = async (req, res) => {
	try {
		const userId = req.user.userId; // Extracted from the token
		console.log("Fetching properties for user ID: ", userId);

		// Fetch the user's properties
		const user = await User.findById(userId).select("properties"); // Assuming 'properties' is a field in the User model

		if (!user) {
			return res
				.status(404)
				.json({ message: "User not found" });
		}

		// Check if the user has properties
		if (!user.properties || user.properties.length === 0) {
			return res.status(200).json({
				message: "No properties found for this user",
				properties: [],
			});
		}

		res.status(200).json({
			message: "Properties retrieved successfully",
			properties: user.properties,
		});
	} catch (error) {
		console.error("Error fetching properties:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * Controller to add a new property for a user
 */

// Define the function to add a new property
exports.addNewProperty = async (req, res) => {
	try {
		const overview = JSON.parse(req.body.overview || "{}");
		const listingDetails = JSON.parse(
			req.body.listingDetails || "{}"
		);
		const amenities = JSON.parse(req.body.amenities || "[]");
		const addressAndLocation = JSON.parse(
			req.body.addressAndLocation || "{}"
		);
		const userId = req.user.userId; // Extract user ID from the authenticated token
		console.log("Add property for userId:", userId);
		console.log("Add property:", JSON.stringify(req.body));

		// Find the user by ID
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(400)
				.json({ message: "User not found" });
		}
		console.log(
			"Entered prop controller for request: ",
			overview.category,
			overview.neighborhood,
			overview.rent,
			userId
		);
		//Validate input
		if (
			!overview ||
			!overview.category ||
			!overview.neighborhood ||
			!overview.rent
		) {
			return res.status(400).json({
				message: "All required fields in the overview must be provided",
			});
		}

		//Validate `overview.category` and `overview.neighborhood`
		const validCategories = ["Single Room", "Apartment"];
		const validNeighborhoods = [
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
		];

		if (!validCategories.includes(overview.category)) {
			return res.status(400).json({
				message: "Invalid category in overview",
			});
		}

		if (!validNeighborhoods.includes(overview.neighborhood)) {
			return res.status(400).json({
				message: "Invalid neighborhood in overview",
			});
		}

		console.log(`Adding property for user ${userId}`);

		// Create a new property document
		const newProperty = new Property({
			userId,
			overview,
			listingDetails,
			amenities,
			addressAndLocation,
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
		res.status(500).json({
			message: "Server error while adding property",
		});
	}
};

/**
 * Controller to get all properties with pagination
 */
exports.getAllProperties = async (req, res) => {
	try {
		// --- Pagination Parameters ---
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 8    ;
		const skip = (page - 1) * limit;
		console.log(req.query);

		// --- Filter Parameters ---
		const {
			category, // e.g., "Single Room", "Apartment"
			roomType, // e.g., "Shared Room", "Single Room" -> NEW
			neighborhood, // e.g., "Allston", "Back Bay"
			rentRange, // e.g., "$1000 - $1500", "$3000+"
			bedrooms, // e.g., "1", "2", "3", "4" (meaning X or more) -> NEW
			bathrooms, // e.g., "1", "2", "3", "4" (meaning X or more) -> NEW
			amenities, // e.g., "Wifi,Parking" (comma-separated string) -> NEW
			sqftMin, // e.g., "1000" -> NEW
			sqftMax, // e.g., "2000" -> NEW
			// Add yearBuiltMin, yearBuiltMax etc. if needed
		} = req.query;

		// --- Build Filter Object ---
		const filterObject = {};

		// Category filter
		if (
			category &&
			Property.schema
				.path("overview.category")
				.enumValues.includes(category)
		) {
			filterObject["overview.category"] = category;
		}
		// Room Type filter
		if (
			roomType &&
			Property.schema
				.path("overview.roomType")
				.enumValues.includes(roomType)
		) {
			filterObject["overview.roomType"] = roomType;
		}

		// Neighborhood filter
		if (
			neighborhood &&
			neighborhood.toLowerCase() !== "any" &&
			Property.schema
				.path("overview.neighborhood")
				.enumValues.includes(neighborhood)
		) {
			filterObject["overview.neighborhood"] = neighborhood;
		}

		// Rent range filter
		if (rentRange) {
			const rentFilter = {};
			const cleanedRange = rentRange.replace(/[$,]/g, "");
			if (cleanedRange.includes("+")) {
				const minRent = parseInt(
					cleanedRange.replace("+", ""),
					10
				);
				if (!isNaN(minRent))
					rentFilter["$gte"] = minRent;
			} else if (cleanedRange.includes("-")) {
				const parts = cleanedRange
					.split("-")
					.map((part) =>
						parseInt(part.trim(), 10)
					);
				if (
					parts.length === 2 &&
					!isNaN(parts[0]) &&
					!isNaN(parts[1])
				) {
					rentFilter["$gte"] = parts[0];
					rentFilter["$lte"] = parts[1];
				}
			}
			if (Object.keys(rentFilter).length > 0) {
				filterObject["overview.rent"] = rentFilter;
			} else {
				console.warn(
					`Could not parse rentRange: ${rentRange}`
				);
			}
		}

		// Bedrooms filter (treat as minimum number)
		if (bedrooms && parseInt(bedrooms, 10) > 0) {
			const minBeds = parseInt(bedrooms, 10);
			if (!isNaN(minBeds)) {
				filterObject["listingDetails.bedrooms"] = {
					$gte: minBeds,
				};
			}
		}

		// Bathrooms filter (treat as minimum number)
		if (bathrooms && parseInt(bathrooms, 10) > 0) {
			const minBaths = parseInt(bathrooms, 10);
			if (!isNaN(minBaths)) {
				filterObject["listingDetails.bathrooms"] = {
					$gte: minBaths,
				};
			}
		}

		// Amenities filter (expects comma-separated string)
		if (
			amenities &&
			typeof amenities === "string" &&
			amenities.trim() !== ""
		) {
			const amenitiesArray = amenities
				.split(",")
				.map((a) => a.trim())
				.filter((a) => a); // Trim and remove empty
			if (amenitiesArray.length > 0) {
				// Ensure all specified amenities are present in the property's amenities array
				filterObject["amenities"] = {
					$all: amenitiesArray,
				};
			}
		}

		// SQFT range filter
		const sqftFilter = {};
		const minSqftNum = parseInt(sqftMin, 10);
		const maxSqftNum = parseInt(sqftMax, 10);

		if (!isNaN(minSqftNum)) {
			sqftFilter["$gte"] = minSqftNum;
		}
		if (!isNaN(maxSqftNum)) {
			sqftFilter["$lte"] = maxSqftNum;
		}
		if (Object.keys(sqftFilter).length > 0) {
			filterObject["listingDetails.size"] = sqftFilter; // Assuming size is the field name
		}

		// --- Logging ---
		console.log("Received Query Params:", req.query);
		console.log(
			"Constructed Mongoose Filter:",
			JSON.stringify(filterObject)
		);

		// --- Database Queries ---
		const properties = await Property.find(filterObject)
			.sort({ createdAt: -1 }) // Default sort by newest
			.skip(skip)
			.limit(limit)
			.lean(); // Use lean for potentially better performance if not modifying docs

		const total = await Property.countDocuments(filterObject);

		console.log(
			`Found ${properties.length} properties for page ${page}. Total matching filters: ${total}`
		);

		// --- Response ---
		res.status(200).json({
			message: "Properties retrieved successfully",
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(total / limit),
				totalItems: total,
				itemsPerPage: limit,
			},
			properties: properties,
		});
	} catch (error) {
		console.error("Error in getAllProperties:", error);
		res.status(500).json({
			message: "Server error while fetching properties",
			error: error.message, // Include error message for debugging
		});
	}
};

exports.getPropertyById = async (req, res) => {
	try {
		const propertyId = req.params.id;
		console.log(`Fetching details for property ID: ${propertyId}`);

		// // Validate if ID is a valid MongoDB ObjectId format (optional but good practice)
		// if (!mongoose.Types.ObjectId.isValid(propertyId)) {
		// 	return res
		// 		.status(400)
		// 		.json({
		// 			message: "Invalid Property ID format.",
		// 		});
		// }

		const property = await Property.findById(propertyId).lean(); // Use lean() for performance

		if (!property) {
			console.log(`Property not found for ID: ${propertyId}`);
			return res
				.status(404)
				.json({ message: "Property not found." });
		}

		console.log(`Property found:`, property);
		res.status(200).json(property); // Return the full property object
	} catch (error) {
		console.error(
			`Error fetching property by ID ${req.params.id}:`,
			error
		);
		res.status(500).json({
			message: "Server error while fetching property details.",
			error: error.message,
		});
	}
};
