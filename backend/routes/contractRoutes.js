const express = require("express");
const router = express.Router();
const {
	createDraft,
	getMyAgreements,
	getContractById,
	updateDraft,
} = require("../controllers/contractController");

// Importing your existing middleware
const { authenticateToken } = require("../middlewares/authMiddleware");

// Protect all routes
router.use(authenticateToken);

router.post("/initiate", createDraft);
router.get("/my-agreements", getMyAgreements);
router.get("/:id", getContractById);
router.put("/:id/update-draft", updateDraft);

module.exports = router;
