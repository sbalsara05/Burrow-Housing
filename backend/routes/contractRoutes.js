const express = require("express");
const router = express.Router();
const {
	createDraft,
	getMyAgreements,
	getContractById,
	updateDraft,
	signContract,
} = require("../controllers/contractController");
const { authenticateToken } = require("../middlewares/authMiddleware"); // Verify your auth middleware path

// Create a new draft
router.post("/initiate", authenticateToken, createDraft);

// Get all agreements for the user
router.get("/my-agreements", authenticateToken, getMyAgreements);

// Get single contract by ID
router.get("/:id", authenticateToken, getContractById);

// Update a draft (Lister only)
router.put("/:id/update-draft", authenticateToken, updateDraft);

// Sign a contract
router.post("/:id/sign", authenticateToken, signContract);

module.exports = router;
