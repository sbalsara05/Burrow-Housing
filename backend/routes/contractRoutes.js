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

// 1. Create a new draft
// URL: POST /api/contracts/initiate
router.post("/initiate", authenticateToken, createDraft);
// 2. Get all agreements for the user
// URL: GET /api/contracts/my-agreements
router.get("/my-agreements", authenticateToken, getMyAgreements);

// 3. Get single contract by ID
// URL: GET /api/contracts/:id
router.get("/:id", authenticateToken, getContractById);
// 4. Update a draft (Lister only)
// URL: PUT /api/contracts/:id
router.put("/:id", authenticateToken, updateDraft);

// 5. Sign a contract
// URL: POST /api/contracts/:id/sign
router.post("/:id/sign", authenticateToken, signContract);
module.exports = router;
