// controllers/otpController.js
const jwt = require("jsonwebtoken");
const otpService = require("../services/otpService");
const { generateToken, blacklistToken } = require('../services/tokenService');

// POST /api/send-otp - Send OTP for verification
exports.sendOTP = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res
				.status(400)
				.json({ message: "Email is required." });
		}

		// Use the service to send OTP
		await otpService.sendOTP(email);

		res.status(200).json({
			message: "Verification code sent to your email.",
		});
	} catch (error) {
		console.error("Error sending OTP:", error);
		res.status(500).json({
			message: error.message || "Internal server error.",
		});
	}
};

// POST /api/resend-otp - Resend OTP
exports.resendOTP = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res
				.status(400)
				.json({ message: "Email is required." });
		}

		// Use the service to send OTP
		await otpService.sendOTP(email);

		res.status(200).json({
			message: "Verification code resent to your email.",
		});
	} catch (error) {
		console.error("Error resending OTP:", error);
		res.status(500).json({
			message: error.message || "Internal server error.",
		});
	}
};

// POST /api/verify-otp - Verify OTP and activate user
exports.verifyOTP = async (req, res) => {
	try {
		const { email, otp } = req.body;

		if (!email || !otp) {
			return res
				.status(400)
				.json({
					message: "Email and OTP are required.",
				});
		}

		// Use the service to verify OTP
		const user = await otpService.verifyOTP(email, otp);

		// Generate a JWT token using the token service
		const token = generateToken(user._id);

		// Respond with success
		res.status(200).json({
			message: "Email verified successfully!",
			token: token,
		});
	} catch (error) {
		console.error("Error verifying OTP:", error);
		res.status(400).json({
			message: error.message || "Internal server error.",
		});
	}
};
