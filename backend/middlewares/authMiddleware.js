// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("../services/tokenService");

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        console.log("Auth token:", token ? "Present" : "Missing");

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
                console.error("JWT verification error:", err);
                return res.status(403).json({
                    message: "Invalid token",
                });
            }

            console.log("=== JWT PAYLOAD ===");
            console.log("Decoded user:", user);
            console.log("User keys:", Object.keys(user));

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

// Optional authentication - doesn't fail if no token is provided
const optionalAuthenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            // No token provided, continue without authentication
            return next();
        }

        // Check if token is blacklisted
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            // Token is blacklisted, continue without authentication
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                // Invalid token, continue without authentication
                console.log("Optional auth: Invalid token, continuing without authentication");
                return next();
            }

            req.user = user; // Attach decoded user info to request if valid
            req.token = token;
            next();
        });
    } catch (error) {
        console.error("Optional authentication error:", error);
        // On error, continue without authentication
        next();
    }
};

module.exports = { authenticateToken, optionalAuthenticateToken };