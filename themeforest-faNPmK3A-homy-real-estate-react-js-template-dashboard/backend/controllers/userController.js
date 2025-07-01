const User = require("../models/userModel"); // Mongoose User model
const bcrypt = require("bcrypt");
const { blacklistToken } = require("../services/tokenService");

exports.getUserProfile = async (req, res) => {
	try {
		const userId = req.user.userId; // Extracted from the token
		console.log("Here is the req id " + JSON.stringify(userId));
		const user = await User.findById(userId); // Fetch selected fields

		console.log("Here is the user details ", user);
		if (!user) {
			return res
				.status(404)
				.json({ message: "User not found" });
		}

		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

exports.updateUserProfile = async (req, res) => {
	const { name, phone } = req.body; // Get data from the request body
	const userId = req.user.userId; // User ID from JWT

	try {
		// Find user by ID and update their information
		const user = await User.findById(userId);

		if (!user) {
			return res
				.status(404)
				.json({ message: "User not found" });
		}

		console.log("Here is the user details ", user);

		// Update user data
		user.name = name || user.name; // Update name, keep old if not provided
		user.phone = phone || user.phone; // Update phone, keep old if not provided

		// Save the updated user data
		await user.save();

		// Return updated user data
		res.status(200).json({
			message: "User data updated successfully",
			user: {
				name: user.name,
				email: user.email,
				phone: user.phone,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Error updating user profile",
		});
	}
};

exports.updateProperty = async (req, res) => {
	const { propertyKey, propertyValue } = req.body; // Get key-value pair to update
	const userId = req.user.userId; // Extract User ID from JWT

	try {
		// Validate input
		if (!propertyKey || propertyValue === undefined) {
			return res
				.status(400)
				.json({
					message: "Property key and value are required",
				});
		}

		// Find the user
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ message: "User not found" });
		}

		console.log(`Updating ${propertyKey} for user ${userId}`);

		// Dynamically update the property
		user[propertyKey] = propertyValue;

		// Save updated user
		await user.save();

		// Return updated user data
		res.status(200).json({
			message: "User property updated successfully",
			updatedProperty: {
				[propertyKey]: propertyValue,
			},
		});
	} catch (error) {
		console.error("Error updating property: ", error);
		res.status(500).json({
			message: "Error updating user property",
		});
	}
};

exports.changePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;
		const userId = req.user.userId;

		// Validate input
		if (!oldPassword || !newPassword) {
			return res
				.status(400)
				.json({
					message: "Old and new passwords are required.",
				});
		}

		// Fetch the user from the database
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ message: "User not found." });
		}

		// Verify the old password
		const isPasswordValid = await bcrypt.compare(
			oldPassword,
			user.password
		);
		if (!isPasswordValid) {
			return res
				.status(401)
				.json({ message: "Incorrect old password." });
		}

		// Validate the new password's complexity
		const passwordRegex =
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|;:'",<>\./?\\`~\-]).{8,}$/;
		if (!passwordRegex.test(newPassword)) {
			return res.status(422).json({
				message: "New password must be at least 8 characters long and include at least one number and one special character.",
			});
		}

		if (oldPassword === newPassword) {
			return res
				.status(400)
				.json({
					message: "New password cannot be the same as the old password.",
				});
		}

		// Hash and save the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();

		// Invalidate the token used for this request
		// The token is attached to the request by the authMiddleware
		const token = req.token;
		if (token) {
			await blacklistToken(token);
		}

		// Send success response
		res.status(200).json({
			message: "Password changed successfully. Please log in again.",
		});
	} catch (error) {
		console.error("Error changing password:", error);
		res.status(500).json({ message: "Internal server error." });
	}
};
