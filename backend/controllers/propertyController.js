const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Property = require("../models/propertyModel");
const { geocodePropertyAddress } = require("../geocodingService");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const User = require("../models/userModel"); // User model
const { json } = require("stream/consumers");
const {
	generatePresignedUrls,
	deleteFileFromS3,
} = require("../services/s3Service");
const Interest = require("../models/interestModel");
const Notification = require("../models/notificationModel");
const { getStreamClient } = require("../services/streamService");

/**
 * Controller to get the properties of a user
 */
exports.getMyProperties = async (req, res) => {
	try {
		const userId = req.user.userId; // Extracted from the token
		console.log("Fetching properties for user ID: ", userId);

		// Fetch the user's properties and populate the 'properties' field with full property documents
		const user = await User.findById(userId).populate("properties");

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
exports.addNewProperty = async (req, res) => {
	try {
		// *** Access directly from req.body ***
		const {
			overview,
			listingDetails,
			amenities,
			addressAndLocation,
			buildingName,
			leaseLength,
			description,
			imageUrls,
		} = req.body; // Destructure directly

		const userId = req.user.userId; // Extract user ID from the authenticated token
		console.log("Add property for userId:", userId);
		console.log(
			"Received body for add property:",
			JSON.stringify(req.body, null, 2)
		); // Log the received body

		// --- Validation (Keep or Enhance) ---
		if (
			!overview ||
			!overview.category ||
			!overview.roomType ||
			!overview.neighborhood ||
			overview.rent === undefined
		) {
			return res.status(400).json({
				message: "Required overview fields missing (category, roomType, neighborhood, rent).",
			});
		}
		if (
			!listingDetails ||
			listingDetails.bedrooms === undefined ||
			listingDetails.bathrooms === undefined ||
			listingDetails.floorNo === undefined
		) {
			return res.status(400).json({
				message: "Required listingDetails fields missing (bedrooms, bathrooms, floorNo).",
			});
		}
		// Ensure numeric fields are valid numbers if provided
		if (
			overview.rent !== undefined &&
			isNaN(Number(overview.rent))
		) {
			return res
				.status(400)
				.json({ message: "Rent must be a number." });
		}
		if (
			listingDetails.bedrooms !== undefined &&
			isNaN(Number(listingDetails.bedrooms))
		) {
			return res.status(400).json({
				message: "Bedrooms must be a number.",
			});
		}
		if (
			listingDetails.bathrooms !== undefined &&
			isNaN(Number(listingDetails.bathrooms))
		) {
			return res.status(400).json({
				message: "Bathrooms must be a number.",
			});
		}
		if (
			listingDetails.floorNo !== undefined &&
			isNaN(Number(listingDetails.floorNo))
		) {
			return res.status(400).json({
				message: "Floor No must be a number.",
			});
		}
		if (
			listingDetails.size !== undefined &&
			listingDetails.size !== null &&
			isNaN(Number(listingDetails.size))
		) {
			return res
				.status(400)
				.json({ message: "Size must be a number." });
		}

		if (
			!addressAndLocation ||
			!addressAndLocation.address ||
			!addressAndLocation.location.lat ||
			!addressAndLocation.location.lng
		) {
			return res.status(400).json({
				message: "addressAndLocation object with address field is required.",
			});
		}
		if (!leaseLength) {
			return res
				.status(400)
				.json({ message: "Lease Length is required." });
		}
		if (!description) {
			return res
				.status(400)
				.json({ message: "Description is required." });
		}

		// Enum Validation (Optional but Recommended)
		// const validCategories = Property.schema.path('overview.category').enumValues;
		// if (!validCategories.includes(overview.category)) return res.status(400).json({ message: "Invalid category" });
		// const validRoomTypes = Property.schema.path('overview.roomType').enumValues;
		// if (!validRoomTypes.includes(overview.roomType)) return res.status(400).json({ message: "Invalid roomType" });
		// const validNeighborhoods = Property.schema.path('overview.neighborhood').enumValues;
		// if (!validNeighborhoods.includes(overview.neighborhood)) return res.status(400).json({ message: "Invalid neighborhood" });

		// --- End Validation ---

		// Find the user by ID
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(400)
				.json({ message: "User not found" });
		}

		console.log(`Adding property for user ${userId}`);

		// Create a new property document using destructured data
		const newProperty = new Property({
			userId,
			overview,
			listingDetails: {
				// Ensure optional fields are handled
				...listingDetails,
				size:
					listingDetails.size !== undefined
						? listingDetails.size
						: null, // Use null or undefined based on schema/preference
			},
			amenities: amenities || [], // Default to empty array if not provided
			addressAndLocation, // Already an object
			buildingName: buildingName || null, // Use null or undefined based on schema/preference
			leaseLength,
			description,
			images: imageUrls || [],
		});

		// Save the new property document to the database
		const savedProperty = await newProperty.save();

		// Associate the property with the user
		if (!Array.isArray(user.properties)) {
			user.properties = [];
		}
		user.properties.push(savedProperty._id);
		await user.save();

		// Respond with success
		res.status(201).json({
			message: "Property added successfully",
			property: savedProperty, // Send back the saved property
		});
	} catch (error) {
		console.error("Error adding property: ", error);
		if (error.name === "ValidationError") {
			return res.status(400).json({
				message: "Validation failed",
				errors: error.errors,
			});
		}
		res.status(500).json({
			message: "Server error while adding property",
			error: error.message,
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
		const limit = parseInt(req.query.limit) || 8;
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
		// Only show Active listings by default (unless status filter is explicitly provided)
		if (!req.query.status) {
			filterObject.status = "Active";
		}
		
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

/**
 * Controller to Get Property by ID
 */
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

/**
 * Controller to Get Presigned URLs for file uploads
 */
exports.getPresignedUrls = async (req, res) => {
	try {
		const { files } = req.body;
		const { userId } = req.user;

		// Call the service to do the heavy lifting
		const urls = await generatePresignedUrls(files, userId);

		res.status(200).json(urls);
	} catch (error) {
		console.error(
			"Error in getPresignedUrls controller:",
			error.message
		);
		// The service throws a generic error, so we can send that back
		// Or handle specific error types if you add them in the service
		res.status(400).json({
			message:
				error.message ||
				"Could not process your request.",
		});
	}
};

/**
 * Controller to delete a property owned by the authenticated user
 */
exports.deleteProperty = async (req, res) => {
	const { id: propertyId } = req.params;
	const { userId } = req.user;

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const property = await Property.findById(propertyId).session(
			session
		);
		if (!property) throw new Error("Property not found.");
		if (property.userId.toString() !== userId)
			throw new Error("Forbidden");

		// --- CASCADING LOGIC ---
		const relatedInterests = await Interest.find({
			propertyId,
		}).session(session);
		const streamClient = getStreamClient();

		if (relatedInterests.length > 0) {
			const renterIds = relatedInterests.map(
				(i) => i.renterId
			);
			const channelIdsToDelete = relatedInterests
				.filter((i) => i.streamChannelId)
				.map((i) => i.streamChannelId);

			// 1. Delete Stream channels
			if (channelIdsToDelete.length > 0) {
				await streamClient.deleteChannels(
					channelIdsToDelete,
					{ hard_delete: true }
				);
			}

			// 2. Create notifications for affected renters
			const notifications = renterIds.map((renterId) => ({
				userId: renterId,
				type: "property_deleted",
				message: `The property "${property.overview.title}" you were interested in is no longer available.`,
				link: "/all_listings",
				metadata: { propertyId },
			}));
			await Notification.insertMany(notifications, {
				session,
			});

			// 3. Delete Interest documents
			await Interest.deleteMany({ propertyId }).session(
				session
			);
		}

		// --- ORIGINAL DELETE LOGIC ---
		if (property.images && property.images.length > 0) {
			const deletionPromises = property.images.map((url) =>
				deleteFileFromS3(url)
			);
			await Promise.all(deletionPromises);
		}
		await property.remove({ session });
		await User.findByIdAndUpdate(userId, {
			$pull: { properties: propertyId },
		}).session(session);

		await session.commitTransaction();
		res.status(200).json({
			message: "Property and all related data deleted successfully.",
		});
	} catch (error) {
		await session.abortTransaction();
		console.error("Error deleting property:", error);
		if (error.message === "Forbidden") {
			return res.status(403).json({
				message: "You do not have permission to delete this property.",
			});
		}
		res.status(500).json({
			message: "Server error during property deletion.",
		});
	} finally {
		session.endSession();
	}
};

/**
 * Controller to UPDATE a property owned by the authenticated user
 */
exports.updateProperty = async (req, res) => {
	try {
		const { id: propertyId } = req.params;
		const { userId } = req.user;
		const { images: finalImageUrls, ...updatedData } = req.body;

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res.status(400).json({
				message: "Invalid property ID format.",
			});
		}

		const property = await Property.findById(propertyId);

		if (!property) {
			return res
				.status(404)
				.json({ message: "Property not found." });
		}

		if (property.userId.toString() !== userId) {
			return res.status(403).json({
				message: "Forbidden: You do not have permission to edit this property.",
			});
		}

		// --- Image Deletion Logic ---
		// Find which images stored in the DB are NOT in the final list sent from the client.
		const imagesToDelete = property.images.filter(
			(dbImageUrl) => !finalImageUrls.includes(dbImageUrl)
		);

		if (imagesToDelete.length > 0) {
			console.log(
				`Deleting ${imagesToDelete.length} images from S3.`
			);
			try {
				const deletionPromises = imagesToDelete.map(
					(url) => deleteFileFromS3(url)
				);
				await Promise.all(deletionPromises);
				console.log(
					"Successfully processed image deletions from S3."
				);
			} catch (s3Error) {
				console.error(
					"A non-critical error occurred during S3 image deletion, but proceeding with DB update.",
					s3Error
				);
			}
		}

		// --- Update Property Document ---
		// Combine the updated text data with the final list of image URLs
		const finalUpdatedData = {
			...updatedData,
			images: finalImageUrls, // This is the complete, correct list of URLs
			updatedAt: new Date(),
		};

		const updatedProperty = await Property.findByIdAndUpdate(
			propertyId,
			{ $set: finalUpdatedData },
			{ new: true, runValidators: true }
		);

		if (!updatedProperty) {
			return res.status(404).json({
				message: "Property not found after update attempt.",
			});
		}

		res.status(200).json({
			message: "Property updated successfully.",
			property: updatedProperty,
		});
	} catch (error) {
		console.error("Error updating property:", error);
		if (error.name === "ValidationError") {
			return res.status(400).json({
				message: "Validation failed",
				errors: error.errors,
			});
		}
		res.status(500).json({
			message: "Server error while updating property.",
			error: error.message,
		});
	}
};

/**
 * Controller to get all PUBLIC properties for a specific user ID
 */
exports.getPropertiesByUserId = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log(
			`Fetching public properties for user ID: ${userId}`
		);

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res
				.status(400)
				.json({ message: "Invalid User ID format." });
		}

		// Find properties that belong to the user AND are active
		const properties = await Property.find({
			userId: userId,
			status: "Active", // Only show active listings on public profiles
		})
			.sort({ createdAt: -1 }) // Show newest first
			.lean();

		if (!properties) {
			// This case is unlikely with find(), which returns [], but good practice
			return res.status(200).json([]);
		}

		res.status(200).json(properties);
	} catch (error) {
		console.error("Error fetching properties by user ID:", error);
		res.status(500).json({ message: "Server error" });
	}
};
