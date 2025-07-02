// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("../services/tokenService");

const authenticateToken = async (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];
		console.log("Auth token:", token);

		if (!token) {
			return res
				.status(401)
				.json({ message: "Access token missing" });
		}

		// Check if token is blacklisted
		const blacklisted = await isTokenBlacklisted(token);
		if (blacklisted) {
			return res
				.status(401)
				.json({ message: "Token has been revoked" });
		}

		jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
			if (err) {
				return res.status(403).json({
					message: "Invalid token",
				});
			}
			req.user = user; // Attach decoded user info to request
			req.token = token; // Store token for potential blacklisting on logout
			next();
		});
	} catch (error) {
		console.error("Authentication error:", error);
		return res
			.status(500)
			.json({ message: "Authentication error" });
	}
};

module.exports = { authenticateToken };
