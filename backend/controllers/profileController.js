const Profile = require("../models/profileModel");
const User = require("../models/userModel");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto');

// Fetch user profile
exports.getProfile = async (req, res) => {
	try {
		const userId = req.user.userId; // Extract userId from the request
		console.log("userId from request:", userId); // Debug log to check the userId

		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ message: "User not found." });
		}
		console.log("User fetched:", user); // Debug log to check the user object

		// Check if the profile exists by userId
		let profile = await Profile.findOne({ userId: userId });
		console.log("Profile fetched:", profile); // Debug log to check the profile data

		if (!profile) {
			console.log(
				"Profile does not exist. Creating a new profile..."
			); // Debug log when profile does not exist
            
			// More robust name parsing
			let firstName = user.name.split(" ")[0]; // First part is always the first name
			let lastName = user.name.split(" ").slice(1).join(" "); // Everything else is the last name

			profile = new Profile({
				userId: user._id, // Link profile to userId
				username: `${firstName} ${lastName}`, // Set username based on the user's name
				school_email: user.email, // Use the user's email from the registration
			});

			await profile.save(); // Save the profile
			console.log("Profile created:", profile); // Debug log after profile creation

			return res
				.status(200)
				.json({
					message: "Profile created and fetched successfully",
					profile,
				});
		}

		// If profile exists, return it
		console.log("Returning existing profile:", profile); // Debug log when returning existing profile
		res.status(200).json(profile);
	} catch (error) {
		console.error("Error fetching profile:", error); // Debug log in case of an error

		// Handle specific error for duplicate key on school_email
		if (
			error.name === "MongoError" ||
			error.name === "MongoServerError"
		) {
			if (
				error.code === 11000 &&
				error.keyPattern &&
				error.keyPattern.school_email
			) {
				return res.status(400).json({
					message: "A profile with this school email already exists.",
					error: "duplicate_email",
				});
			}
		}

		res.status(500).json({
			message: "Error fetching profile",
			error: error.message,
		});
	}
};

// Generate Presigned URL for Profile Image Upload
exports.getProfileImagePresignedUrl = async (req, res) => {
	// Configure the S3 client for DigitalOcean Spaces
	const s3Client = new S3Client({
		endpoint: `https://${process.env.SPACES_ENDPOINT}`,
		region: "us-east-1", // This is a required placeholder for the SDK
		credentials: {
			accessKeyId: process.env.SPACES_KEY,
			secretAccessKey: process.env.SPACES_SECRET,
		},
	});

	try {
		const { filename, contentType } = req.body;
		
		// Validate input
		if (!filename || !contentType) {
			return res.status(400).json({
				message: "Filename and content type are required.",
			});
		}

		// Validate content type (only allow images)
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(contentType.toLowerCase())) {
			return res.status(400).json({
				message: "Only JPEG, PNG, and WebP images are allowed.",
			});
		}

		const userId = req.user.userId;
		const uniqueSuffix = crypto.randomBytes(16).toString("hex");
		const key = `profiles/${userId}/${uniqueSuffix}-${filename.replace(/\s+/g, "-")}`;

		const command = new PutObjectCommand({
			Bucket: process.env.SPACES_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
			ACL: "public-read", // This makes the file public after upload
		});

		// Generate the temporary URL for uploading
		const signedUrl = await getSignedUrl(s3Client, command, { 
			expiresIn: 300 
		}); // Link is valid for 5 minutes

		// Generate the final public URL to be stored in the database
		const publicUrl = `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_ENDPOINT}/${key}`;

		res.status(200).json({
			signedUrl,
			publicUrl,
			message: "Presigned URL generated successfully"
		});

	} catch (error) {
		console.error("Error generating presigned URL for profile image:", error);
		res.status(500).json({
			message: "Could not generate upload link for profile image.",
			error: error.message
		});
	}
};

// Update profile with image URL
exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user.userId; // Extract userId from the request
		const {
			username,
			school_email,
			majors_minors,
			school_attending,
			about,
			imageUrl, // New field for image URL from S3
		} = req.body; // Extract fields from the request body

		console.log("Update request for userId:", userId);
		console.log("Update data:", JSON.stringify(req.body, null, 2));

		// Validate input data
		if (!username || !school_email) {
			return res.status(400).json({
				message: "Username and school email are required.",
			});
		}

		// Check if the profile exists
		let profile = await Profile.findOne({ userId: userId });

		if (!profile) {
			console.log("Profile not found for userId:", userId);
			return res.status(404).json({
				message: "Profile not found. Please create a profile first.",
			});
		}

		// Update profile fields
		profile.username = username || profile.username;
		profile.school_email = school_email || profile.school_email;
		profile.majors_minors = majors_minors || profile.majors_minors;
		profile.school_attending = school_attending || profile.school_attending;
		profile.about = about || profile.about;

		// Update image URL if provided
		if (imageUrl) {
			profile.image = imageUrl;
		}

		// Save updated profile
		const updatedProfile = await profile.save();

		console.log("Profile updated successfully:", updatedProfile);
		res.status(200).json({
			message: "Profile updated successfully.",
			profile: updatedProfile,
		});
	} catch (error) {
		console.error("Error updating profile:", error);

		// Handle specific error for duplicate key on school_email
		if (
			error.name === "MongoError" ||
			error.name === "MongoServerError"
		) {
			if (
				error.code === 11000 &&
				error.keyPattern &&
				error.keyPattern.school_email
			) {
				return res.status(400).json({
					message: "A profile with this school email already exists.",
					error: "duplicate_email",
				});
			}
		}

		res.status(500).json({
			message: "Error updating profile.",
			error: error.message,
		});
	}
};