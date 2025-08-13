const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { getRedisClient } = require("./redis");
require("dotenv").config();

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

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
	origin: [
		"http://localhost:4173",
		"http://127.0.0.1:4173",
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	], // Allow this specific origin
	methods: ["GET", "POST", "PUT", "DELETE"],
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// MongoDB Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("Connection error:", err));

// Initialize Redis connection
(async () => {
	try {
		await getRedisClient();
		console.log("Redis initialized successfully");
	} catch (error) {
		console.error("Failed to initialize Redis:", error);
	}
})();

// API Routes
app.get("/api/data", (req, res) => {
	res.json({
		message: "Hello from the backend!",
		data: [1, 2, 3, 4],
	});
});

// Add this ROOT route handler
app.get("/", (req, res) => {
	res.json({
		message: "Burrow Housing API is running!",
		status: "OK",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
		endpoints: {
			api: "/api/*",
			health: "/health"
		}
	});
});

// Optional: Add a health check endpoint
app.get("/health", (req, res) => {
	res.json({
		status: "healthy",
		uptime: process.uptime(),
		timestamp: new Date().toISOString()
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

// Start the Server
const PORT = process.env.PORT || 3000; // Use a different port from React's default
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(
		"GOOGLE_PLACES_API_KEY loaded:",
		process.env.GOOGLE_PLACES_API_KEY ? "YES" : "NO"
	);
	console.log(
		"FOURSQUARE_API_KEY loaded:",
		process.env.FOURSQUARE_API_KEY ? "YES" : "NO"
	);
});
