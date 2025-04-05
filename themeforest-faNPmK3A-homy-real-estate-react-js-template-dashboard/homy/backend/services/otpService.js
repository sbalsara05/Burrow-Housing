const User = require("../models/userModel");
const sgMail = require("@sendgrid/mail");
const { getRedisClient } = require("../redis");

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate a random 6-digit OTP
const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to user's email using SendGrid Dynamic Templates
const sendOTPEmail = async (email, otp) => {
	try {
		// Find user to get name
		const user = await User.findOne({ email });
		const userName = user ? user.name : "there"; // Fallback if name not found

		// Template data - these values replace the template variables
		const templateData = {
			otp: otp,
			name: userName,
			year: new Date().getFullYear(),
		};

		const msg = {
			to: email,
			from: {
				email: process.env.SENDGRID_FROM_EMAIL,
				name: "Burrow Housing",
			},
			subject: "Verify Your Burrow Account",
			templateId: process.env.SENDGRID_TEMPLATE_ID,
			dynamicTemplateData: templateData,
		};

		await sgMail.send(msg);
		console.log(`Verification email sent to ${email}`);
		return true;
	} catch (error) {
		console.error("Error sending email:", error);
		if (error.response) {
			console.error(error.response.body);
		}
		return false;
	}
};

// Function to generate and send OTP
const sendOTP = async (email) => {
	if (!email) {
		throw new Error("Email is required");
	}

	// Generate OTP
	const otp = generateOTP();

	// Store OTP in Redis with 10-minute expiration
	const redisClient = await getRedisClient();
	await redisClient.set(`otp:${email}`, otp, { EX: 600 }); // 10 minutes in seconds

	// Send OTP to email
	const emailSent = await sendOTPEmail(email, otp);

	if (!emailSent) {
		throw new Error("Failed to send verification email");
	}

	return true;
};

// Function to verify OTP
const verifyOTP = async (email, otp) => {
	if (!email || !otp) {
		throw new Error("Email and OTP are required");
	}

	const redisClient = await getRedisClient();

	// Get OTP from Redis
	const storedOTP = await redisClient.get(`otp:${email}`);

	if (!storedOTP) {
		throw new Error(
			"OTP has expired or does not exist. Please request a new one."
		);
	}

	// Verify OTP
	if (storedOTP !== otp) {
		throw new Error("Invalid OTP. Please try again.");
	}

	// Find user and mark as verified
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error("User not found.");
	}

	// Update user's verification status
	user.isVerified = true;
	await user.save();

	// Remove OTP from Redis
	await redisClient.del(`otp:${email}`);

	return user;
};

module.exports = {
	sendOTP,
	verifyOTP,
};
// This module provides functions to generate, send, and verify OTPs for user verification using Redis and SendGrid.