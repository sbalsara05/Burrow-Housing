const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
	saveDraft,
	getMyDrafts,
	getDraftById,
	deleteDraft,
} = require("../controllers/draftController");

const asyncHandler = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next);

router.post("/drafts", authenticateToken, asyncHandler(saveDraft));
router.get("/drafts", authenticateToken, asyncHandler(getMyDrafts));
router.get("/drafts/:id", authenticateToken, asyncHandler(getDraftById));
router.delete("/drafts/:id", authenticateToken, asyncHandler(deleteDraft));

module.exports = router;
