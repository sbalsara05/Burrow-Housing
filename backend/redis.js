// backend/redis.js
const { createClient } = require("redis");

let redisClient;

async function connectRedis() {
	// Replace with your actual Redis Enterprise Cloud connection string
	const redisUrl = process.env.REDIS_URL;

	if (!redisUrl) {
		throw new Error(
			"REDIS_URL is not set in environment variables. Email notifications require Redis."
		);
	}

	console.log("Connecting to Redis...");

	redisClient = createClient({
		url: redisUrl,
		socket: {
			tls: false,
			rejectUnauthorized: false,
		},
	});

	redisClient.on("error", (error) => {
		console.error("Redis connection error:", error);
	});

	redisClient.on("connect", () => {
		console.log("✓ Connected to Redis");
	});

	redisClient.on("ready", () => {
		console.log("✓ Redis client ready");
	});

	try {
		await redisClient.connect();
		console.log("✓ Redis initialized successfully");
		return redisClient;
	} catch (error) {
		console.error("✗ Failed to connect to Redis:", error.message);
		throw error;
	}
}

// Initialize Redis connection
const getRedisClient = async () => {
	if (!redisClient || !redisClient.isOpen) {
		return await connectRedis();
	}
	return redisClient;
};

module.exports = { getRedisClient };
