const express = require("express");
const router = express.Router();
const {
	createDraft,
	getMyAgreements,
	getContractById,
	updateDraft,
	lockContract,
	recallContract,
	signContract,
	deleteContract,
} = require("../controllers/contractController");
const { authenticateToken } = require("../middlewares/authMiddleware"); // Verify your auth middleware path

// Create a new draft
router.post("/initiate", authenticateToken, createDraft);

// Get all agreements for the user
router.get("/my-agreements", authenticateToken, getMyAgreements);

// Get single contract by ID (also supports /:id/sign for GET - same response)
router.get("/:id", authenticateToken, getContractById);
router.get("/:id/sign", authenticateToken, getContractById);

// Update a draft (Lister only)
router.put("/:id/update-draft", authenticateToken, updateDraft);

// Sign a contract
router.post("/:id/sign", authenticateToken, signContract);

// Lock/finalize a contract (Lister only)
router.post("/:id/lock", authenticateToken, lockContract);

// Recall contract to draft (Lister only, PENDING_TENANT_SIGNATURE only)
router.post("/:id/recall", authenticateToken, recallContract);

// Delete a contract (Lister only, DRAFT or CANCELLED only)
router.delete("/:id", authenticateToken, deleteContract);

module.exports = router;
