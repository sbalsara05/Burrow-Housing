// backend/services/emailService.js
const SibApiV3Sdk = require("sib-api-v3-sdk");
const User = require("../models/userModel");
const { getRedisClient } = require("../redis");

// --- Brevo Client Initialization ---
// Configure the default client with your API key
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create an instance of the Transactional Emails API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// --- Helper Functions ---

// Generate a random 6-digit OTP
const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * A generic function to send a transactional email using a Brevo template.
 * @param {number} templateId - The ID of the Brevo template.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} toName - The recipient's name.
 * @param {object} params - The dynamic parameters for the template (e.g., { otp: '123456' }).
 */
const sendTransactionalEmail = async (templateId, toEmail, toName, params) => {
	const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	sendSmtpEmail.to = [{ email: toEmail, name: toName }];
	sendSmtpEmail.templateId = templateId;
	sendSmtpEmail.params = {
		...params,
		year: new Date().getFullYear(), // Automatically add the current year
	};
	sendSmtpEmail.sender = {
		name: "Burrow Housing",
		email: process.env.BREVO_SENDER_EMAIL,
	};

	try {
		await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log(
			`Successfully sent template ${templateId} to ${toEmail}`
		);
		return true;
	} catch (error) {
		console.error(
			`Error sending Brevo email to ${toEmail}:`,
			error.response ? error.response.body : error
		);
		throw new Error(`Failed to send email via Brevo.`);
	}
};

// --- Core Service Functions ---

/**
 * Generates and sends an OTP for email verification.
 * @param {string} email - The user's email address.
 */
const sendOTP = async (email) => {
	if (!email) throw new Error("Email is required");

	const user = await User.findOne({ email });
	if (!user) throw new Error("User not found.");

	const otp = generateOTP();
	const redisClient = await getRedisClient();
	await redisClient.set(`otp:${email}`, otp, { EX: 600 }); // 10-minute expiration

	await sendTransactionalEmail(
		parseInt(process.env.BREVO_OTP_TEMPLATE_ID),
		email,
		user.name,
		{ name: user.name, otp: otp }
	);

	return true;
};

/**
 * Sends a welcome email to a user after successful verification.
 * @param {string} email - The user's email address.
 */
const sendWelcomeEmail = async (email) => {
	const user = await User.findOne({ email });
	if (!user) {
		console.warn(
			`Could not find user with email ${email} to send welcome email.`
		);
		return;
	}

	await sendTransactionalEmail(
		parseInt(process.env.BREVO_WELCOME_TEMPLATE_ID),
		email,
		user.name,
		{ name: user.name }
	);
};

/**
 * Verifies the provided OTP, updates user status, and sends a welcome email.
 * @param {string} email - The user's email address.
 * @param {string} otp - The 6-digit OTP from the user.
 * @returns {object} The verified user object.
 */
const verifyOTP = async (email, otp) => {
	if (!email || !otp) throw new Error("Email and OTP are required");

	const redisClient = await getRedisClient();
	const storedOTP = await redisClient.get(`otp:${email}`);

	if (!storedOTP)
		throw new Error(
			"OTP has expired or does not exist. Please request a new one."
		);
	if (storedOTP !== otp)
		throw new Error("Invalid OTP. Please try again.");

	const user = await User.findOne({ email });
	if (!user) throw new Error("User not found.");

	user.isVerified = true;
	await user.save();

	await redisClient.del(`otp:${email}`);

	// Send the welcome email after successful verification
	try {
		await sendWelcomeEmail(email);
	} catch (welcomeError) {
		console.error(
			"Failed to send welcome email, but OTP verification was successful.",
			welcomeError
		);
		// We don't throw an error here because the primary action (verification) succeeded.
	}

	return user;
};

// We will use this function when we build the "Forgot Password" feature.
const sendPasswordResetEmail = async (email, resetToken) => {
	const user = await User.findOne({ email });
	if (!user) {
		console.warn(
			`Attempted to send password reset to non-existent user: ${email}`
		);
		return;
	}

	// This link points to your frontend. We will build this page in Phase 2.
	const resetLink = `http://www.burrowhousing.com/reset-password?token=${resetToken}`;

	await sendTransactionalEmail(
		parseInt(process.env.BREVO_PASS_RESET_TEMPLATE_ID),
		email,
		user.name,
		{ name: user.name, reset_link: resetLink }
	);
};
module.exports = {
	sendOTP,
	verifyOTP,
	sendPasswordResetEmail, // Exporting for future use
};
