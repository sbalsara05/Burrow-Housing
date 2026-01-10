const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { getRedisClient } = require("./redis");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const otpRoutes = require("./routes/otpRoutes");
const nearbyRoutes = require("./routes/nearbyRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const interestRoutes = require("./routes/interestRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const ambassadorRequestRoutes = require("./routes/ambassadorRequestRoutes");
const ambassadorDashboardRoutes = require("./routes/ambassadorDashboardRoutes");

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Dynamic CORS Options
const allowedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",")
	: [
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:4173",
			"http://127.0.0.1:4173",
	  ];

const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) === -1) {
			const msg =
				"The CORS policy for this site does not allow access from the specified Origin.";
			return callback(new Error(msg), false);
		}
		return callback(null, true);
	},
	methods: ["GET", "POST", "PUT", "DELETE"],
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// MongoDB Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("Connection error:", err));

// Initialize Redis connection and email queue
(async () => {
	try {
		console.log("Initializing Redis connection...");
		const redisClient = await getRedisClient();
		
		// Initialize email queue after Redis is ready
		console.log("Initializing email notification queue...");
		require("./queues/emailQueue");
		
		// Wait a moment for queue to initialize
		await new Promise(resolve => setTimeout(resolve, 500));
		
		console.log("✓ Email notification queue initialized");

		// Verify environment variables
		console.log("\n📧 Email Notification Configuration:");
		if (!process.env.BREVO_NOTIFICATION_TEMPLATE_ID) {
			console.warn(
				"  ⚠️  BREVO_NOTIFICATION_TEMPLATE_ID is not set. Email notifications will fail."
			);
			console.warn(
				"     See SETUP_BREVO_TEMPLATE.md for instructions on creating a template."
			);
		} else {
			console.log(
				`  ✓ Template ID configured: ${process.env.BREVO_NOTIFICATION_TEMPLATE_ID}`
			);
		}

		if (!process.env.BREVO_API_KEY) {
			console.warn(
				"  ⚠️  BREVO_API_KEY is not set. Email notifications will fail."
			);
		} else {
			console.log("  ✓ Brevo API key configured");
		}
		
		if (!process.env.BREVO_SENDER_EMAIL) {
			console.warn(
				"  ⚠️  BREVO_SENDER_EMAIL is not set. Check your email service configuration."
			);
		} else {
			console.log(`  ✓ Sender email: ${process.env.BREVO_SENDER_EMAIL}`);
		}
		
		if (!process.env.REDIS_URL) {
			console.warn(
				"  ⚠️  REDIS_URL is not set. Email queue will not work."
			);
		} else {
			console.log("  ✓ Redis URL configured");
		}
		console.log(""); // Empty line for readability
	} catch (error) {
		console.error("\n✗ Failed to initialize email notification system:");
		console.error(`  Error: ${error.message}`);
		console.error(
			"  Email notifications will not work until this is resolved.\n"
		);
	}
})();

// Add this ROOT route handler
app.get("/", (req, res) => {
	res.json({
		message: "Burrow Housing API is running!",
		status: "OK",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
		endpoints: {
			api: "/api/*",
			health: "/health",
		},
	});
});

// Optional: health check endpoint
app.get("/health", (req, res) => {
	res.json({
		status: "healthy",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	});
});

// Routes
app.use("/api", authRoutes); // Authentication routes (register, login)
app.use("/api", profileRoutes); // Fetch Profile details
app.use("/api", propertyRoutes); // Property management routes
app.use("/api", otpRoutes); // OTP verification routes
app.use("/api", nearbyRoutes); // Nearby places routes
app.use("/api", favoritesRoutes); // Favorites management routes
app.use("/api", interestRoutes); // Interest management routes
app.use("/api", chatRoutes); // Chat management routes
app.use("/api", notificationRoutes); // Notification management routes
app.use("/api", ambassadorRequestRoutes); // Ambassador request management routes
app.use("/api/ambassador", ambassadorDashboardRoutes); // Ambassador dashboard routes

// Start the Server
const PORT = process.env.PORT || 5001; // Use a different port from React's default
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
