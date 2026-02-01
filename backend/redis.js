// backend/redis.js
const { createClient } = require("redis");

let redisClient;
let connectPromise = null;

function createRedisClient() {
	const redisUrl = process.env.REDIS_URL;

	if (!redisUrl) {
		throw new Error(
			"REDIS_URL is not set in environment variables. Email notifications require Redis."
		);
	}

	const useTls = redisUrl.startsWith("rediss://");

	const client = createClient({
		url: redisUrl,
		socket: {
			tls: useTls,
			rejectUnauthorized: false,
			reconnectStrategy(retries) {
				if (retries > 20) {
					console.error("Redis: gave up reconnecting after 20 attempts");
					return new Error("Redis reconnection limit reached");
				}
				const delay = Math.min(retries * 100, 3000);
				console.log(`Redis: reconnecting in ${delay}ms (attempt ${retries})`);
				return delay;
			},
		},
	});

	client.on("error", (error) => {
		console.error("Redis connection error:", error.message);
	});

	client.on("connect", () => {
		console.log("✓ Connected to Redis");
	});

	client.on("ready", () => {
		console.log("✓ Redis client ready");
	});

	client.on("end", () => {
		console.log("Redis connection closed");
	});

	client.on("reconnecting", () => {
		console.log("Redis reconnecting...");
	});

	return client;
}

async function connectRedis() {
	if (redisClient) {
		try {
			if (redisClient.isOpen) return redisClient;
			await redisClient.connect();
			return redisClient;
		} catch (err) {
			console.error("Redis reconnect failed:", err.message);
			redisClient = null;
		}
	}

	console.log("Connecting to Redis...");
	redisClient = createRedisClient();

	try {
		await redisClient.connect();
		console.log("✓ Redis initialized successfully");
		return redisClient;
	} catch (error) {
		console.error("✗ Failed to connect to Redis:", error.message);
		redisClient = null;
		throw error;
	}
}

const getRedisClient = async () => {
	if (connectPromise) {
		return connectPromise;
	}
	if (!redisClient || !redisClient.isOpen) {
		connectPromise = connectRedis()
			.finally(() => {
				connectPromise = null;
			});
		return connectPromise;
	}
	return redisClient;
};

module.exports = { getRedisClient };
