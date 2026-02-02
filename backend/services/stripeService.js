const Stripe = require("stripe");

let stripeInstance = null;

/** Lazy Stripe client so app can start without STRIPE_SECRET_KEY (payments will error until set). */
function getStripe() {
	if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.trim() === "") {
		throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing or empty)");
	}
	if (!stripeInstance) {
		stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
	}
	return stripeInstance;
}

/**
 * Create a PaymentIntent for a given amount.
 * @param {number} amountCents - Amount in cents (e.g. 120000 = $1200)
 * @param {string} currency - ISO currency (default 'usd')
 * @param {Object} metadata - Optional metadata (e.g. contractId, tenantId)
 * @param {string} [receiptEmail] - Optional customer email for receipt
 * @param {"card"|"ach"} [paymentMethod] - Payment method (defaults to "card")
 * @returns {Promise<{id: string, clientSecret: string}>}
 */
async function createPaymentIntent(
	amountCents,
	currency = "usd",
	metadata = {},
	receiptEmail = null,
	paymentMethod = "card"
) {
	const method = paymentMethod === "ach" ? "ach" : "card";
	const params = {
		amount: Math.round(amountCents),
		currency,
		payment_method_types: [method === "ach" ? "us_bank_account" : "card"],
		metadata: { ...metadata },
	};
	if (receiptEmail) params.receipt_email = receiptEmail;

	const stripe = getStripe();
	const intent = await stripe.paymentIntents.create(params);
	return {
		id: intent.id,
		clientSecret: intent.client_secret,
	};
}

/**
 * Construct and verify a Stripe webhook event from raw body + signature.
 * @param {Buffer|string} payload - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @param {string} webhookSecret - STRIPE_WEBHOOK_SECRET
 * @returns {Stripe.Event}
 */
function constructWebhookEvent(payload, signature, webhookSecret) {
	return Stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

module.exports = {
	getStripe,
	createPaymentIntent,
	constructWebhookEvent,
};
