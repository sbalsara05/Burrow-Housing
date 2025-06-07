const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const otpRoutes = require("./routes/otpRoutes");
const { getRedisClient } = require("./redis");
const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
	origin: ["http://localhost:4173", "http://127.0.0.1:4173","http://localhost:5173", "http://127.0.0.1:5173"], // Allow this specific origin
	methods: ["GET", "POST", "PUT", "DELETE"],
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// MongoDB Connection
const uri =
	process.env.MONGODB_URI;
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

// Routes
app.use("/api", authRoutes); // Authentication routes (register, login)
app.use("/api", profileRoutes); // Fetch Profile details
app.use("/api", propertyRoutes);
app.use("/api", otpRoutes); // OTP verification routes

// Start the Server
const PORT = process.env.PORT || 3000; // Use a different port from React's default
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
