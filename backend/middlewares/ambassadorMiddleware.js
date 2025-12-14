const User = require("../models/userModel");

// Middleware to require ambassador role
const requireAmbassador = async (req, res, next) => {
	try {
		const userId = req.user.userId;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}

		if (!user.isAmbassador || user.ambassadorStatus !== "active") {
			return res.status(403).json({
				error: "Ambassador access required. You must be an active ambassador to access this resource.",
			});
		}

		next();
	} catch (error) {
		console.error("Error in requireAmbassador middleware:", error);
		res.status(500).json({
			error: "Server error while verifying ambassador status.",
		});
	}
};

module.exports = { requireAmbassador };
