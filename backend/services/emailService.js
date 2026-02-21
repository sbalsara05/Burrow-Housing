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
		name: "Burrow Housing Limited",
		email: process.env.BREVO_SENDER_EMAIL,
	};

	try {
		await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log(
			`Successfully sent template ${templateId} to ${toEmail}`
		);
		return true;
	} catch (error) {
		const errorDetails = error.response?.body || error.message || error;
		console.error(`[Email Service] Error sending Brevo email to ${toEmail}:`);
		console.error(`[Email Service] Error response:`, JSON.stringify(errorDetails, null, 2));
		console.error(`[Email Service] Status code:`, error.response?.statusCode || error.status || 'N/A');
		console.error(`[Email Service] Full error:`, error);
		
		// Create a more informative error message
		const errorMessage = error.response?.body?.message || error.message || 'Unknown error';
		throw new Error(`Failed to send email via Brevo: ${errorMessage}`);
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
	const frontendUrl = process.env.FRONTEND_URL || "https://www.burrowhousing.com";
	const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

	await sendTransactionalEmail(
		parseInt(process.env.BREVO_PASS_RESET_TEMPLATE_ID),
		email,
		user.name,
		{ name: user.name, reset_link: resetLink }
	);
};

/**
 * Sends a notification email to a user.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} toName - The recipient's name.
 * @param {string} notificationType - The type of notification (e.g., 'new_interest', 'new_message').
 * @param {object} notificationData - Additional data for the notification (message, link, etc.).
 */
const sendNotificationEmail = async (
	toEmail,
	toName,
	notificationType,
	notificationData
) => {
	if (!toEmail || !toName) {
		throw new Error("Email and name are required");
	}

	// Get the frontend base URL from environment or use default
	const frontendUrl =
		process.env.FRONTEND_URL || "https://www.burrowhousing.com";
	
	// Build the notification link with query param to auto-open notifications dropdown
	let notificationLink;
	if (notificationData.link) {
		// Check if link already has query params
		const separator = notificationData.link.includes('?') ? '&' : '?';
		notificationLink = `${frontendUrl}${notificationData.link}${separator}openNotifications=true`;
	} else {
		notificationLink = `${frontendUrl}/dashboard/notifications`;
	}

	// Prepare email parameters
	const emailParams = {
		name: toName,
		message: notificationData.message || "You have a new notification.",
		link: notificationLink,
		linkText: "View Notification",
		// Add any additional metadata
		...(notificationData.metadata || {}),
	};

	// Map notification types to template IDs (if you have specific templates)
	// For now, use a generic notification template
	// You can create specific templates in Brevo and map them here
	const templateIdMap = {
		new_interest: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		interest_approved: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		interest_declined: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		interest_withdrawn: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		new_message: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		property_deleted: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		property_favorited: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		ambassador_request: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		ambassador_request_update: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		ambassador_request_cancelled: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		contract_pending: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		contract_tenant_signed: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		contract_completed: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		contract_payment_received: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
		contract_cancelled: process.env.BREVO_NOTIFICATION_TEMPLATE_ID,
	};

	const templateId =
		templateIdMap[notificationType] ||
		process.env.BREVO_NOTIFICATION_TEMPLATE_ID;

	if (!templateId) {
		const errorMsg = `[Email Service] ERROR: No notification template ID configured (BREVO_NOTIFICATION_TEMPLATE_ID). Cannot send email to ${toEmail}.`;
		console.error(errorMsg);
		console.error(
			"[Email Service] To fix this:\n" +
			"  1. Log into Brevo dashboard (https://app.brevo.com)\n" +
			"  2. Go to Transactional Emails > Templates\n" +
			"  3. Create a new template with variables: {{params.name}}, {{params.message}}, {{params.link}}\n" +
			"  4. Copy the template ID\n" +
			"  5. Add BREVO_NOTIFICATION_TEMPLATE_ID=<template_id> to your .env file\n" +
			"  6. Restart your server"
		);
		throw new Error(
			"Email notification template ID is not configured. Please set BREVO_NOTIFICATION_TEMPLATE_ID in environment variables. See server logs for instructions."
		);
	}

	// Validate template ID is a number
	const templateIdNum = parseInt(templateId);
	if (isNaN(templateIdNum)) {
		const errorMsg = `[Email Service] ERROR: Invalid template ID "${templateId}". Template ID must be a number.`;
		console.error(errorMsg);
		throw new Error(`Invalid email template ID: ${templateId}`);
	}

	console.log(
		`[Email Service] Sending ${notificationType} email to ${toEmail} using template ${templateIdNum}`
	);

	try {
		await sendTransactionalEmail(templateIdNum, toEmail, toName, emailParams);
		console.log(
			`[Email Service] ✓ Successfully sent ${notificationType} email to ${toEmail}`
		);
	} catch (error) {
		console.error(
			`[Email Service] ✗ Failed to send ${notificationType} email to ${toEmail}:`,
			error.message
		);
		throw error;
	}
};

module.exports = {
	sendOTP,
	verifyOTP,
	sendPasswordResetEmail,
	sendNotificationEmail,
};
