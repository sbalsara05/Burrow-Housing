const Profile = require("../models/profileModel");
const User = require("../models/userModel");
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

// exports.updateProfile = async (req, res) => {
//     try {
//         const userId = req.user.userId; // Extract userId from the request
//         const { username, school_email, majors_minors, school_attending, about } = req.body; // Extract fields from the request body
//         const file = req.file; // Extract uploaded file from request

//         console.log('Update request for userId:', userId);
//         console.log('Update data:', req.body);

//         // Validate input data
//         if (!username || !school_email) {
//             return res.status(400).json({ message: "Username and school email are required." });
//         }

//         // Check if the profile exists
//         let profile = await Profile.findOne({ userId: userId });

//         if (!profile) {
//             console.log('Profile not found for userId:', userId);
//             return res.status(404).json({ message: "Profile not found. Please create a profile first." });
//         }

//         // Update profile fields
//         profile.username = username || profile.username;
//         profile.school_email = school_email || profile.school_email;
//         profile.majors_minors = majors_minors || profile.majors_minors;
//         profile.school_attending = school_attending || profile.school_attending;
//         profile.about = about || profile.about;

//         // If a file is uploaded, update the profile image
//         if (file) {
//             profile.image = file.path || null; // Assuming you're using disk storage, otherwise use file.buffer
//         }

//         // Save updated profile
//         const updatedProfile = await profile.save();

//         console.log('Profile updated successfully:', updatedProfile);
//         res.status(200).json({ message: "Profile updated successfully.", profile: updatedProfile });
//     } catch (error) {
//         console.error('Error updating profile:', error);
//         res.status(500).json({ message: "Error updating profile.", error });
//     }
// };
exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user.userId; // Extract userId from the request
		const {
			username,
			school_email,
			majors_minors,
			school_attending,
			about,
		} = req.body; // Extract fields from the request body

		const file = req.file;
		console.log("Update request for userId:", userId);
		console.log(
			"Update data:",
			JSON.stringify(req.body),
			username,
			school_email
		);

		// Validate input data
		if (!username || !school_email) {
			return res
				.status(400)
				.json({
					message: "Username and school email are required.",
				});
		}

		// Check if the profile exists
		let profile = await Profile.findOne({ userId: userId });

		if (!profile) {
			console.log("Profile not found for userId:", userId);
			return res
				.status(404)
				.json({
					message: "Profile not found. Please create a profile first.",
				});
		}

		// Update profile fields
		profile.username = username || profile.username;
		profile.school_email = school_email || profile.school_email;
		profile.majors_minors = majors_minors || profile.majors_minors;
		profile.school_attending =
			school_attending || profile.school_attending;
		profile.about = about || profile.about;

		//If a file is uploaded, update the profile image
		if (file) {
			profile.image = file.path || null; // Assuming you're using disk storage, otherwise use file.buffer
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
		res.status(500).json({
			message: "Error updating profile.",
			error,
		});
	}
};

//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded." });
//         }

//         // Assuming email is passed in body
//         const { email } = req.body;
//         const profile = await Profile.findOneAndUpdate(
//             { email },
//             {
//                 $set: {
//                     username,
//                     school_attending,
//                     majors_minors,
//                     about,
//                 },
//             },
//             { new: true, upsert: true }
//         );

//         if (!profile) {
//             return res.status(404).json({ message: "Profile not found." });
//         }

//         res.status(200).json({ message: "Profile image updated successfully", profile });
//     } catch (error) {
//         res.status(500).json({ message: "Error uploading image", error });
//     }
// };
