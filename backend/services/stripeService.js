const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a PaymentIntent for a given amount.
 * @param {number} amountCents - Amount in cents (e.g. 120000 = $1200)
 * @param {string} currency - ISO currency (default 'usd')
 * @param {Object} metadata - Optional metadata (e.g. contractId, tenantId)
 * @param {string} [receiptEmail] - Optional customer email for receipt
 * @returns {Promise<{id: string, clientSecret: string}>}
 */
async function createPaymentIntent(amountCents, currency = "usd", metadata = {}, receiptEmail = null) {
	const params = {
		amount: Math.round(amountCents),
		currency,
		payment_method_types: ["card"],
		metadata: { ...metadata },
	};
	if (receiptEmail) params.receipt_email = receiptEmail;

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
	stripe,
	createPaymentIntent,
	constructWebhookEvent,
};
