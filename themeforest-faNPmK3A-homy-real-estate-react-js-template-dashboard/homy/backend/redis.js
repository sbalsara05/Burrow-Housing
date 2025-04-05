// backend/redis.js
const { createClient } = require("redis");

let redisClient;

async function connectRedis() {
	// Replace with your actual Redis Enterprise Cloud connection string
	const redisUrl =
		process.env.REDIS_URL;

	redisClient = createClient({
		url: redisUrl,
		socket: {
			tls: process.env.NODE_ENV === "production",
			rejectUnauthorized:
				process.env.NODE_ENV === "production",
		},
	});

	redisClient.on("error", (error) => {
		console.error("Redis connection error:", error);
	});

	redisClient.on("connect", () => {
		console.log("Connected to Redis");
	});

	await redisClient.connect();
	return redisClient;
}

// Initialize Redis connection
const getRedisClient = async () => {
	if (!redisClient || !redisClient.isOpen) {
		return await connectRedis();
	}
	return redisClient;
};

module.exports = { getRedisClient };
