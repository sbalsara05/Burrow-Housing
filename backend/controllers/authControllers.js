const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const otpService = require("../services/emailService");
const { generateToken, blacklistToken } = require("../services/tokenService");

// POST /api/register - User Registration
exports.register = async (req, res) => {
	try {
		const { name, email, password, whatsappNumber } = req.body;

		// Validate input
		if (!name || !email || !password) {
			return res
				.status(400)
				.json({ message: "All fields are required." });
		}

		// Validate email format
		const emailRegex =
			/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		if (!emailRegex.test(email)) {
			return res
				.status(422)
				.json({ message: "Invalid email format." });
		}

		// Require Northeastern University email
		if (!email.toLowerCase().endsWith("@northeastern.edu")) {
			return res
				.status(422)
				.json({ message: "Only Northeastern University emails (@northeastern.edu) are allowed." });
		}

		// Check if the user already exists by email
		const existingUserByEmail = await User.findOne({ email });
		if (existingUserByEmail) {
			return res
				.status(400)
				.json({
					message: "Email is already registered.",
				});
		}

		// Check if the phone number is already in use (if provided)
		if (whatsappNumber) {
			const existingUserByPhone = await User.findOne({
				phone: whatsappNumber,
			});
			if (existingUserByPhone) {
				return res
					.status(400)
					.json({
						message: "Phone number is already registered.",
					});
			}
		}

		// Password validation (minimum 8 characters, at least 1 number and 1 special character)
		const passwordRegex =
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|;:'",<>\./?\\`~\-]).{8,}$/;
		if (!passwordRegex.test(password)) {
			return res.status(422).json({
				message: "Password must be at least 8 characters long and include at least one number and one special character.",
			});
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Save the user in the database as unverified
		const user = new User({
			name,
			email,
			password: hashedPassword,
			phone: whatsappNumber,
			isVerified: false, // User starts as unverified
		});

		await user.save();

		// Generate an OTP for verification using the service
		try {
			await otpService.sendOTP(email);
		} catch (otpError) {
			console.error(
				"Error sending verification email:",
				otpError
			);
			// We continue despite email sending failure, but log the error
		}

		// Respond with success message
		res.status(201).json({
			message: "User registered successfully! Please verify your email.",
		});
	} catch (error) {
		console.error("Error during registration:", error);

		// Ensure we always respond with JSON (prevents HTML error pages from proxy)
		const sendJson = (status, body) => {
			res.setHeader("Content-Type", "application/json");
			res.status(status).json(body);
		};

		// Handle duplicate key errors more gracefully
		if (
			error.name === "MongoError" ||
			error.name === "MongoServerError"
		) {
			if (error.code === 11000) {
				const keyPattern = error.keyPattern || {};
				if (keyPattern.email) {
					return sendJson(400, { message: "Email is already registered." });
				}
				if (keyPattern.phone) {
					return sendJson(400, { message: "Phone number is already registered." });
				}
				return sendJson(400, { message: "A user with this information already exists." });
			}
		}

		sendJson(500, { message: "Internal server error." });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate input
		if (!email || !password) {
			return res
				.status(400)
				.json({
					message: "Email and password are required.",
				});
		}

		// Validate email format
		const emailRegex =
			/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		if (!emailRegex.test(email)) {
			return res
				.status(422)
				.json({ message: "Invalid email format." });
		}

		// Require Northeastern University email
		if (!email.toLowerCase().endsWith("@northeastern.edu")) {
			return res
				.status(422)
				.json({ message: "Only Northeastern University emails (@northeastern.edu) are allowed." });
		}

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(400)
				.json({
					message: "Invalid email or password.",
				});
		}

		// Compare the provided password with the hashed password in the database
		const isPasswordValid = await bcrypt.compare(
			password,
			user.password
		);
		if (!isPasswordValid) {
			return res
				.status(400)
				.json({
					message: "Invalid email or password.",
				});
		}

		// Check if user has verified their email
		if (!user.isVerified) {
			// Generate a new OTP and send it using the service
			try {
				await otpService.sendOTP(email);
			} catch (otpError) {
				console.error(
					"Error sending verification email:",
					otpError
				);
				// Continue despite email sending error, but log it
			}

			return res.status(403).json({
				message: "Your email is not verified. A new verification code has been sent to your email.",
				requiresVerification: true,
				email: email,
			});
		}

		// Generate a JWT token using the token service
		const token = generateToken(user._id);

		// Respond with a success message and the token
		res.status(200).json({
			message: "Login successful!",
			token: token,
		});
	} catch (error) {
		console.error("Error during login:", error?.message || error);
		if (!res.headersSent) {
			res.setHeader("Content-Type", "application/json");
			res.status(500).json({ message: "Internal server error." });
		}
	}
};

// Add a logout function
exports.logout = async (req, res) => {
	try {
		const token = req.token; // From the auth middleware

		if (!token) {
			return res
				.status(400)
				.json({ message: "No token provided" });
		}

		// Blacklist the token
		await blacklistToken(token);

		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ message: "Error during logout" });
	}
};

const client = new OAuth2Client(
	"220393809553-40cjemj8m5tbeltqgrgtqoso7rfu1kil.apps.googleusercontent.com"
);

// Google Sign-In handler
exports.googleSignIn = async (req, res) => {
	try {
		// Get the access token from the request body
		const { access_token } = req.body;

		console.log("Received Google access token:", access_token);

		if (!access_token) {
			return res
				.status(400)
				.json({ message: "Access token is required" });
		}

		// Use the access token to fetch user info from Google's API
		const googleUserInfo = await axios.get(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			}
		);

		console.log("Google user info:", googleUserInfo.data);

		// Extract user information
		const { sub, email, name, picture } = googleUserInfo.data;

		// Require Northeastern University email for Google sign-in
		if (!email || !email.toLowerCase().endsWith("@northeastern.edu")) {
			return res
				.status(403)
				.json({
					message: "Only Northeastern University emails (@northeastern.edu) can sign in.",
				});
		}

		// Generate a JWT token
		const jwtToken = jwt.sign(
			{
				userId: sub, // Using Google's user ID as our userId
				email,
				name,
			},
			process.env.JWT_SECRET || "stonepaperscissors", // Using your existing secret
			{
				expiresIn: "1h",
			}
		);

		// Return the JWT token
		res.status(200).json({
			message: "Google authentication successful",
			token: jwtToken,
			user: {
				name,
				email,
				picture,
			},
		});
	} catch (error) {
		console.error("Google authentication error:", error);
		res.status(401).json({
			message: "Invalid Google token",
			error: error.message,
		});
	}
};
