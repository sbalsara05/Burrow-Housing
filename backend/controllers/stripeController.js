const Contract = require("../models/contractModel");
const {
	stripe,
	createPaymentIntent,
	constructWebhookEvent,
} = require("../services/stripeService");

/**
 * Parse dollar strings (e.g. "$1,200", "500") to cents.
 * Returns 0 for invalid or "TBD".
 */
function parseDollarsToCents(value) {
	if (!value || typeof value !== "string" || /TBD|n\/a/i.test(value.trim()))
		return 0;
	const cleaned = value.replace(/[$,]/g, "");
	const num = parseFloat(cleaned);
	if (Number.isNaN(num) || num < 0) return 0;
	return Math.round(num * 100);
}

function _getVar(vars, key) {
	if (!vars) return undefined;
	if (typeof vars.get === "function") return vars.get(key);
	return vars[key];
}

/**
 * Derive total payment amount in cents from contract variables.
 * Uses Rent_Amount + Security_Deposit. Minimum 50 cents for Stripe.
 */
function getPaymentAmountCents(contract) {
	const v = contract.variables || {};
	const rent = parseDollarsToCents(
		_getVar(v, "Rent_Amount") || _getVar(v, "rent_amount")
	);
	const deposit = parseDollarsToCents(
		_getVar(v, "Security_Deposit") || _getVar(v, "security_deposit")
	);
	const total = rent + deposit;
	return Math.max(50, total);
}

/**
 * Create a PaymentIntent for a completed contract.
 * Only available when both parties have signed (status COMPLETED).
 * Callable by tenant or lister. Amount from Rent_Amount + Security_Deposit.
 */
exports.createPaymentIntentForContract = async (req, res) => {
	try {
		const { contractId } = req.body;
		const userId = req.user.userId;

		if (!contractId) {
			return res.status(400).json({ message: "contractId is required" });
		}

		const contract = await Contract.findById(contractId)
			.populate("tenant", "name email")
			.populate("lister", "name email");

		if (!contract) {
			return res.status(404).json({ message: "Contract not found" });
		}

		const isTenant = contract.tenant._id.toString() === userId;
		const isLister = contract.lister._id.toString() === userId;
		if (!isTenant && !isLister) {
			return res.status(403).json({
				message: "Only the tenant or lister can create a payment for this contract.",
			});
		}

		if (contract.status !== "COMPLETED") {
			return res.status(400).json({
				message: "Payment is only available after both parties have signed the contract.",
			});
		}

		// Reuse existing PaymentIntent if present and not yet succeeded
		if (contract.stripePaymentIntentId && contract.stripePaymentStatus !== "succeeded") {
			const pi = await stripe.paymentIntents.retrieve(
				contract.stripePaymentIntentId
			);
			if (pi.status !== "succeeded" && pi.status !== "canceled") {
				return res.status(200).json({
					clientSecret: pi.client_secret,
					paymentIntentId: pi.id,
				});
			}
		}

		const amountCents = getPaymentAmountCents(contract);
		const recipientEmail =
			contract.lister && contract.lister.email
				? contract.lister.email
				: undefined;

		const { id, clientSecret } = await createPaymentIntent(
			amountCents,
			"usd",
			{
				contractId: contractId.toString(),
				tenantId: (contract.tenant && contract.tenant._id)?.toString(),
				listerId: (contract.lister && contract.lister._id)?.toString(),
			},
			recipientEmail
		);

		contract.stripePaymentIntentId = id;
		contract.stripePaymentStatus = "pending";
		await contract.save();

		return res.status(200).json({
			clientSecret,
			paymentIntentId: id,
			amountCents,
		});
	} catch (err) {
		console.error("Stripe createPaymentIntent error:", err);
		res.status(500).json({
			message: "Failed to create payment intent",
			error: err.message,
		});
	}
};

/**
 * Stripe webhook handler. Must receive raw body for signature verification.
 * Handles payment_intent.succeeded and optionally payment_intent.payment_failed.
 */
exports.handleWebhook = async (req, res) => {
	const sig = req.headers["stripe-signature"];
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		console.error("STRIPE_WEBHOOK_SECRET is not set");
		return res.status(500).send("Webhook secret not configured");
	}

	let event;
	try {
		// req.body is raw Buffer when using express.raw
		event = constructWebhookEvent(req.body, sig, webhookSecret);
	} catch (e) {
		console.error("Stripe webhook signature verification failed:", e.message);
		return res.status(400).send(`Webhook Error: ${e.message}`);
	}

	try {
		switch (event.type) {
			case "payment_intent.succeeded": {
				const pi = event.data.object;
				const contractId = pi.metadata && pi.metadata.contractId;
				if (!contractId) break;

				await Contract.findOneAndUpdate(
					{ _id: contractId },
					{ stripePaymentStatus: "succeeded" }
				);
				console.log(`Contract ${contractId} payment succeeded`);
				break;
			}
			case "payment_intent.payment_failed": {
				const pi = event.data.object;
				const contractId = pi.metadata && pi.metadata.contractId;
				if (!contractId) break;

				await Contract.findOneAndUpdate(
					{ _id: contractId },
					{ stripePaymentStatus: "failed" }
				);
				console.log(`Contract ${contractId} payment failed`);
				break;
			}
			default:
				// Unhandled event type
				break;
		}
	} catch (err) {
		console.error("Webhook handler error:", err);
		return res.status(500).send("Webhook handler failed");
	}

	res.status(200).json({ received: true });
};
