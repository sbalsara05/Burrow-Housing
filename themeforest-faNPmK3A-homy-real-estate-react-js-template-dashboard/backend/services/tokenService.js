// backend/services/tokenService.js
const { getRedisClient } = require("../redis");
const jwt = require("jsonwebtoken");

// Generate a JWT token
const generateToken = (userId) => {
	return jwt.sign(
		{ userId },
		process.env.JWT_SECRET || "stonepaperscissors",
		{ expiresIn: "1h" }
	);
};

// Store token in Redis blacklist
const blacklistToken = async (token) => {
	try {
		const redisClient = await getRedisClient();
		const decoded = jwt.decode(token);

		if (!decoded || !decoded.exp) {
			throw new Error("Invalid token");
		}

		// Calculate remaining time until token expiry
		const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);

		if (expiryTime <= 0) {
			return true; // Token already expired, no need to blacklist
		}

		// Add to blacklist with same expiry as the token
		await redisClient.set(`blacklist:${token}`, "1", {
			EX: expiryTime,
		});
		return true;
	} catch (error) {
		console.error("Error blacklisting token:", error);
		throw error;
	}
};

// Check if token is blacklisted
const isTokenBlacklisted = async (token) => {
	try {
		const redisClient = await getRedisClient();
		const result = await redisClient.get(`blacklist:${token}`);
		return !!result;
	} catch (error) {
		console.error("Error checking blacklisted token:", error);
		// If Redis is down, default to allowing the token
		// You may want to change this behavior based on your security requirements
		return false;
	}
};

module.exports = {
	generateToken,
	blacklistToken,
	isTokenBlacklisted,
};
