const Contract = require("../models/contractModel");
const {
	stripe,
	createPaymentIntent,
	constructWebhookEvent,
} = require("../services/stripeService");

const TENANT_FEE_BPS = 250; // 2.5%
const LISTER_FEE_BPS = 250; // 2.5%
const CARD_SURCHARGE_BPS = 100; // 1.0% (tenant side only, card only)

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
 * Rent-only, as deposits are off-platform per policy.
 */
function getRentCents(contract) {
	const v = contract.variables || {};
	return parseDollarsToCents(
		_getVar(v, "Rent_Amount") || _getVar(v, "rent_amount")
	);
}

function _roundBps(amountCents, bps) {
	return Math.round((amountCents * bps) / 10000);
}

function computePaymentSnapshot(rentCents, paymentMethod) {
	const method = paymentMethod === "ach" ? "ach" : "card";

	const tenantFeeCents = _roundBps(rentCents, TENANT_FEE_BPS);
	const listerFeeCents = _roundBps(rentCents, LISTER_FEE_BPS);
	const cardSurchargeCents =
		method === "card" ? _roundBps(rentCents, CARD_SURCHARGE_BPS) : 0;

	const amountToChargeCents = rentCents + tenantFeeCents + cardSurchargeCents;
	const amountToPayoutCents = rentCents - listerFeeCents;

	return {
		rentCents,
		tenantFeeCents,
		listerFeeCents,
		cardSurchargeCents,
		paymentMethod: method,
		amountToChargeCents,
		amountToPayoutCents,
	};
}

/**
 * Create a PaymentIntent for a completed contract.
 * Only available when both parties have signed (status COMPLETED).
 * Callable by tenant only. Charges rent + tenant fees (and card surcharge if card).
 */
exports.createPaymentIntentForContract = async (req, res) => {
	try {
		const { contractId, paymentMethod } = req.body;
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
		if (!isTenant) {
			return res.status(403).json({
				message: "Only the tenant can initiate payment for this contract.",
			});
		}

		if (contract.status !== "COMPLETED") {
			return res.status(400).json({
				message: "Payment is only available after both parties have signed the contract.",
			});
		}

		// Enforce payment window (default set at completion time)
		if (
			contract.paymentExpiresAt &&
			Date.now() > new Date(contract.paymentExpiresAt).getTime() &&
			contract.paymentStatus !== "SUCCEEDED" &&
			contract.stripePaymentStatus !== "succeeded"
		) {
			// Best-effort cancel any existing PI
			if (contract.stripePaymentIntentId) {
				try {
					const pi = await stripe.paymentIntents.retrieve(
						contract.stripePaymentIntentId
					);
					if (pi.status !== "succeeded" && pi.status !== "canceled") {
						await stripe.paymentIntents.cancel(pi.id);
					}
				} catch (e) {
					// ignore cancellation failures; still mark expired
				}
			}

			contract.paymentStatus = "EXPIRED";
			contract.stripePaymentStatus = "canceled";
			await contract.save();

			return res.status(410).json({
				message: "Payment window expired for this contract.",
				paymentStatus: contract.paymentStatus,
			});
		}

		if (
			contract.paymentStatus === "SUCCEEDED" ||
			contract.stripePaymentStatus === "succeeded"
		) {
			return res.status(409).json({
				message: "This contract has already been paid.",
				paymentStatus: "SUCCEEDED",
			});
		}

		const method = paymentMethod === "ach" ? "ach" : "card";

		const rentCents = getRentCents(contract);
		if (!rentCents || rentCents <= 0) {
			return res.status(400).json({
				message:
					"Cannot create payment: Rent_Amount is missing or invalid on this contract.",
			});
		}

		const snapshot = computePaymentSnapshot(rentCents, method);
		const amountCents = Math.max(50, snapshot.amountToChargeCents);

		// If an existing PI exists, reuse it only if method matches and it's still payable.
		if (contract.stripePaymentIntentId && contract.stripePaymentStatus !== "succeeded") {
			const existingMethod =
				contract.paymentSnapshot && contract.paymentSnapshot.paymentMethod
					? contract.paymentSnapshot.paymentMethod
					: null;

			// If method changed (e.g. card -> ach), cancel and recreate.
			if (existingMethod && existingMethod !== method) {
				try {
					const pi = await stripe.paymentIntents.retrieve(
						contract.stripePaymentIntentId
					);
					if (pi.status !== "succeeded" && pi.status !== "canceled") {
						await stripe.paymentIntents.cancel(pi.id);
					}
				} catch (e) {
					// ignore
				}
				contract.stripePaymentIntentId = undefined;
				contract.stripePaymentStatus = "";
			} else {
				const pi = await stripe.paymentIntents.retrieve(
					contract.stripePaymentIntentId
				);
				if (pi.status !== "succeeded" && pi.status !== "canceled") {
					// Keep snapshot stable for support/UI
					if (!contract.paymentSnapshot || contract.paymentSnapshot.rentCents === 0) {
						contract.paymentSnapshot = snapshot;
						await contract.save();
					}
					return res.status(200).json({
						clientSecret: pi.client_secret,
						paymentIntentId: pi.id,
						amountCents,
						paymentStatus: contract.paymentStatus || "PENDING",
					});
				}
			}
		}

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
			recipientEmail,
			method
		);

		contract.stripePaymentIntentId = id;
		contract.stripePaymentStatus = "pending";
		contract.paymentStatus = "PENDING";
		contract.paymentSnapshot = snapshot;
		await contract.save();

		return res.status(200).json({
			clientSecret,
			paymentIntentId: id,
			amountCents,
			paymentStatus: contract.paymentStatus,
			paymentSnapshot: snapshot,
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
					{
						stripePaymentStatus: "succeeded",
						paymentStatus: "SUCCEEDED",
					}
				);
				console.log(`Contract ${contractId} payment succeeded`);
				break;
			}
			case "payment_intent.processing": {
				const pi = event.data.object;
				const contractId = pi.metadata && pi.metadata.contractId;
				if (!contractId) break;

				await Contract.findOneAndUpdate(
					{ _id: contractId },
					{
						stripePaymentStatus: "processing",
						paymentStatus: "PROCESSING",
					}
				);
				break;
			}
			case "payment_intent.canceled": {
				const pi = event.data.object;
				const contractId = pi.metadata && pi.metadata.contractId;
				if (!contractId) break;

				await Contract.findOneAndUpdate(
					{ _id: contractId },
					{
						stripePaymentStatus: "canceled",
						paymentStatus: "CANCELED",
					}
				);
				break;
			}
			case "payment_intent.payment_failed": {
				const pi = event.data.object;
				const contractId = pi.metadata && pi.metadata.contractId;
				if (!contractId) break;

				await Contract.findOneAndUpdate(
					{ _id: contractId },
					{
						stripePaymentStatus: "failed",
						paymentStatus: "FAILED",
					}
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
