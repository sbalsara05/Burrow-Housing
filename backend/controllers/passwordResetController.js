const crypto = require("crypto");
const User = require("../models/userModel");
const { getRedisClient } = require("../redis");
const { sendPasswordResetEmail } = require("../services/emailService");
const bcrypt = require('bcryptjs');

exports.requestPasswordReset = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({
				message: "Email address is required.",
			});
		}

		const user = await User.findOne({ email });

		// Security: Always send a success response to prevent email enumeration.
		if (!user) {
			console.log(
				`Password reset requested for non-existent user: ${email}`
			);
			return res.status(200).json({
				message: "If an account with that email exists, a password reset link has been sent.",
			});
		}

		// Generate a secure token
		const resetToken = crypto.randomBytes(32).toString("hex");
		// Hash the token before storing it for security
		const hashedToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Store the hashed token in Redis with the user's ID as the value and a 15-minute expiry
		const redisClient = await getRedisClient();
		await redisClient.set(
			`reset:${hashedToken}`,
			user._id.toString(),
			{
				EX: 900, // 900 seconds = 15 minutes
			}
		);

		// Send the email with the UNHASHED token
		await sendPasswordResetEmail(user.email, resetToken);

		res.status(200).json({
			message: "If an account with that email exists, a password reset link has been sent.",
		});
	} catch (error) {
		console.error(
			"Error in requestPasswordReset controller:",
			error
		);
		// Generic error for the client
		res.status(500).json({
			message: "An internal error occurred. Please try again later.",
		});
	}
};

/**
 * Verifies if a password reset token is valid and not expired.
 */
exports.verifyResetToken = async (req, res) => {
	try {
		const { token } = req.query;
		if (!token) {
			return res
				.status(400)
				.json({ message: "Token is required." });
		}

		const hashedToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");
		const redisClient = await getRedisClient();
		const userId = await redisClient.get(`reset:${hashedToken}`);

		if (!userId) {
			return res
				.status(400)
				.json({
					message: "This password reset link is invalid or has expired.",
				});
		}

		res.status(200).json({ message: "Token is valid." });
	} catch (error) {
		console.error("Error verifying reset token:", error);
		res.status(500).json({ message: "Internal server error." });
	}
};

/**
 * Submits a new password using a valid reset token.
 */
exports.submitPasswordReset = async (req, res) => {
	try {
		const { token, newPassword } = req.body;
		if (!token || !newPassword) {
			return res
				.status(400)
				.json({
					message: "Token and new password are required.",
				});
		}

		// Validate password complexity
		const passwordRegex =
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|;:'",<>\./?\\`~\-]).{8,}$/;
		if (!passwordRegex.test(newPassword)) {
			return res.status(422).json({
				message: "Password must be at least 8 characters long and include at least one number and one special character.",
			});
		}

		const hashedToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");
		const redisClient = await getRedisClient();
		const userId = await redisClient.get(`reset:${hashedToken}`);

		if (!userId) {
			return res
				.status(400)
				.json({
					message: "This password reset link is invalid or has expired.",
				});
		}

		const user = await User.findById(userId);
		if (!user) {
			// This case is unlikely but a good safeguard
			return res
				.status(404)
				.json({ message: "User not found." });
		}

		// Hash the new password and update the user document
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();

		// Invalidate the token in Redis immediately
		await redisClient.del(`reset:${hashedToken}`);

		res.status(200).json({
			message: "Password has been reset successfully.",
		});
	} catch (error) {
		console.error("Error submitting password reset:", error);
		res.status(500).json({ message: "Internal server error." });
	}
};
