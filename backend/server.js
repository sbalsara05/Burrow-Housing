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
const contractRoutes = require("./routes/contractRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const { handleWebhook } = require("./controllers/stripeController");

// Initialize Express app
const app = express();

// Stripe webhook must receive raw body for signature verification – mount before express.json()
app.post(
	"/api/stripe/webhook",
	express.raw({ type: "application/json" }),
	(req, res, next) => {
		handleWebhook(req, res).catch(next);
	}
);

// Middleware
app.use(express.json());

// Dynamic CORS Options (trim each origin so .env trailing spaces don't break prod)
const allowedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
	: [
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:4173",
			"http://127.0.0.1:4173",
	  ];
// In prod, also allow http:// so redirects or direct http don't break CORS
if (process.env.NODE_ENV === "production" && allowedOrigins.length > 0) {
	const httpOrigins = allowedOrigins
		.filter((o) => o.startsWith("https://"))
		.map((o) => o.replace(/^https:/, "http:"));
	httpOrigins.forEach((o) => { if (!allowedOrigins.includes(o)) allowedOrigins.push(o); });
}

if (process.env.NODE_ENV === "production") {
	console.log("CORS allowed origins:", allowedOrigins.length ? allowedOrigins.join(", ") : "(none – set CORS_ORIGIN in .env)");
}

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) === -1) {
			console.warn("CORS rejected Origin:", origin, "| Allowed:", allowedOrigins.join(", "));
			// Don't throw – reject with callback so CORS sends proper response
			return callback(null, false);
		}
		return callback(null, true);
	},
	methods: ["GET", "POST", "PUT", "DELETE"],
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// MongoDB connection with retries (so prod doesn't serve traffic until DB is ready)
// Use backend/.env MONGODB_URI (e.g. Atlas); if unset and using Docker Redis, fall back to local mongo container
const MONGODB_URI =
	process.env.MONGODB_URI ||
	(process.env.REDIS_URL && process.env.REDIS_URL.includes("redis:6379")
		? "mongodb://admin:password123@mongo:27017/?authSource=admin"
		: null);
const MONGODB_RETRIES = Number(process.env.MONGODB_RETRIES) || 10;
const MONGODB_RETRY_DELAY_MS = Number(process.env.MONGODB_RETRY_DELAY_MS) || 3000;

async function connectMongo() {
	if (!MONGODB_URI) {
		console.error("MONGODB_URI is not set. Set it in backend/.env (e.g. your Atlas URI for prod).");
		process.exit(1);
	}
	for (let attempt = 1; attempt <= MONGODB_RETRIES; attempt++) {
		try {
			await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
			console.log("MongoDB connected");
			return;
		} catch (err) {
			console.error(`MongoDB connection attempt ${attempt}/${MONGODB_RETRIES} failed:`, err.message);
			if (attempt === MONGODB_RETRIES) {
				console.error("Giving up. Exiting so the process can be restarted (e.g. by Docker).");
				process.exit(1);
			}
			await new Promise((r) => setTimeout(r, MONGODB_RETRY_DELAY_MS));
		}
	}
}

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

		console.log("\n💳 Stripe Configuration:");
		if (!process.env.STRIPE_SECRET_KEY) {
			console.warn(
				"  ⚠️  STRIPE_SECRET_KEY is not set. Payment intents will fail."
			);
		} else {
			console.log("  ✓ Stripe secret key configured");
		}
		if (!process.env.STRIPE_WEBHOOK_SECRET) {
			console.warn(
				"  ⚠️  STRIPE_WEBHOOK_SECRET is not set. Webhooks will not be verified."
			);
		} else {
			console.log("  ✓ Stripe webhook secret configured");
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
			stripe: "/api/stripe/create-payment-intent",
			stripeWebhook: "/api/stripe/webhook",
		},
	});
});

// Health check (also at /api/health for load balancers / Docker)
// Includes MongoDB and Redis status for debugging prod (e.g. burrowhousing.com)
const healthPayload = () => {
	const mongoState = ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] ?? "unknown";
	return {
		status: mongoose.connection.readyState === 1 ? "healthy" : "degraded",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		mongodb: mongoState,
		redis: process.env.REDIS_URL ? "configured" : "not_configured",
	};
};
app.get("/health", (req, res) => res.json(healthPayload()));
app.get("/api/health", (req, res) => res.json(healthPayload()));

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
app.use("/api/contracts", contractRoutes); //Contract management routes
app.use("/api/stripe", stripeRoutes); // Stripe payment intents (create-payment-intent)

// Global error handler: always return JSON (never HTML) so frontend never sees proxy HTML
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	if (res.headersSent) return next(err);
	res.setHeader("Content-Type", "application/json");
	res.status(500).json({
		message: "Internal server error.",
		...(process.env.NODE_ENV === "development" && { error: err.message }),
	});
});

// Start the Server only after MongoDB is connected
const PORT = process.env.PORT || 5001;
async function start() {
	await connectMongo();
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}
start().catch((err) => {
	console.error("Startup failed:", err);
	process.exit(1);
});
