const express = require("express");
const router = express.Router();
const { createPaymentIntentForContract } = require("../controllers/stripeController");
const { authenticateToken } = require("../middlewares/authMiddleware");

/**
 * POST /api/stripe/create-payment-intent
 * Body: { contractId: string, paymentMethod?: "card" | "ach" }
 * Creates a PaymentIntent for a COMPLETED contract (both sides signed).
 * Returns { clientSecret, paymentIntentId, amountCents }.
 * Webhook is mounted separately in server.js with raw body.
 */
router.post("/create-payment-intent", authenticateToken, createPaymentIntentForContract);

module.exports = router;
