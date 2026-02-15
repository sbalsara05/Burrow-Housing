const Contract = require("../models/contractModel");
const Property = require("../models/propertyModel");
const Notification = require("../models/notificationModel");
const {
	getStripe,
	createPaymentIntent,
	constructWebhookEvent,
} = require("../services/stripeService");
const { queueNotificationEmail } = require("../utils/notificationEmailHelper");

/** If contract is COMPLETED and both parties have paid, mark the property as lease taken over. */
async function markPropertyLeaseTakenOverIfBothPaid(contractId) {
	try {
		const contract = await Contract.findById(contractId).select("status property paymentStatus stripePaymentStatus listerPaymentStatus listerStripePaymentStatus");
		if (!contract || contract.status !== "COMPLETED" || !contract.property) return;
		const tenantPaid = contract.paymentStatus === "SUCCEEDED" || contract.stripePaymentStatus === "succeeded";
		const listerPaid = contract.listerPaymentStatus === "SUCCEEDED" || contract.listerStripePaymentStatus === "succeeded";
		if (tenantPaid && listerPaid) {
			await Property.findByIdAndUpdate(contract.property, {
				leaseTakenOver: true,
				status: "Inactive",
			});
			console.log(`Property ${contract.property} marked as lease taken over and deactivated (contract ${contractId})`);
		}
	} catch (e) {
		console.warn("markPropertyLeaseTakenOverIfBothPaid:", e.message);
	}
}

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

	// Charge only the service fee (2.5% + 1% if card). Rent is paid through other portals.
	const amountToChargeCents = Math.max(50, tenantFeeCents + cardSurchargeCents);

	return {
		rentCents,
		tenantFeeCents,
		listerFeeCents,
		cardSurchargeCents,
		paymentMethod: method,
		amountToChargeCents,
		amountToPayoutCents: 0, // Rent not collected by platform
	};
}

/**
 * Create a PaymentIntent for a completed contract.
 * Only available when both parties have signed (status COMPLETED).
 * Callable by tenant only. Charges only the platform service fee (2.5% of rent + 1% if card).
 * Rent is paid through other portals; Burrow does not collect rent.
 */
exports.createPaymentIntentForContract = async (req, res) => {
	try {
		const { contractId, paymentMethod } = req.body;
		const userId = (req.user?.userId || req.user?.id || "").toString();

		if (!contractId) {
			return res.status(400).json({ message: "contractId is required" });
		}

		const contract = await Contract.findById(contractId)
			.populate("tenant", "name email")
			.populate("lister", "name email");

		if (!contract) {
			return res.status(404).json({ message: "Contract not found" });
		}

		const isTenant = contract.tenant?._id?.toString() === userId;
		const isLister = contract.lister?._id?.toString() === userId;
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

		const rentCents = getRentCents(contract);
		if (!rentCents || rentCents <= 0) {
			return res.status(400).json({
				message:
					"Cannot create payment: Rent_Amount is missing or invalid on this contract.",
			});
		}

		const method = paymentMethod === "ach" ? "ach" : "card";
		const snapshot = computePaymentSnapshot(rentCents, method);

		// --- TENANT PAYMENT (2.5% + 1% if card) ---
		if (isTenant) {
			const tenantPaid = contract.paymentStatus === "SUCCEEDED" || contract.stripePaymentStatus === "succeeded";
			if (tenantPaid) {
				return res.status(409).json({
					message: "You have already paid your service fee.",
					paymentStatus: "SUCCEEDED",
				});
			}

			if (contract.paymentExpiresAt && Date.now() > new Date(contract.paymentExpiresAt).getTime()) {
				if (contract.stripePaymentIntentId) {
					try {
						const pi = await getStripe().paymentIntents.retrieve(contract.stripePaymentIntentId);
						if (pi.status !== "succeeded" && pi.status !== "canceled") {
							await getStripe().paymentIntents.cancel(pi.id);
						}
					} catch (e) { /* ignore */ }
				}
				contract.paymentStatus = "EXPIRED";
				contract.stripePaymentStatus = "canceled";
				await contract.save();
				return res.status(410).json({ message: "Payment window expired.", paymentStatus: contract.paymentStatus });
			}

			const amountCents = Math.max(50, snapshot.tenantFeeCents + snapshot.cardSurchargeCents);

			if (contract.stripePaymentIntentId && contract.stripePaymentStatus !== "succeeded") {
				try {
					const pi = await getStripe().paymentIntents.retrieve(contract.stripePaymentIntentId);
					const piMethod = pi.payment_method_types?.[0];
					const wantsAch = method === "ach";
					const piMatchesMethod =
						(wantsAch && piMethod === "us_bank_account") || (!wantsAch && piMethod === "card");
					if (pi.status !== "succeeded" && pi.status !== "canceled" && piMatchesMethod) {
						if (!contract.paymentSnapshot || contract.paymentSnapshot.rentCents === 0) {
							contract.paymentSnapshot = snapshot;
							await contract.save();
						}
						return res.status(200).json({
							clientSecret: pi.client_secret,
							paymentIntentId: pi.id,
							amountCents,
							paymentStatus: contract.paymentStatus || "PENDING",
							paymentSnapshot: snapshot,
							payer: "tenant",
						});
					}
					if (pi.status !== "succeeded" && pi.status !== "canceled" && !piMatchesMethod) {
						await getStripe().paymentIntents.cancel(pi.id).catch(() => {});
						contract.stripePaymentIntentId = undefined;
						contract.stripePaymentStatus = "";
					}
				} catch (e) { /* ignore */ }
			}

			const { id, clientSecret } = await createPaymentIntent(
				amountCents,
				"usd",
				{
					contractId: contractId.toString(),
					tenantId: contract.tenant?._id?.toString(),
					listerId: contract.lister?._id?.toString(),
					payer: "tenant",
				},
				contract.tenant?.email,
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
				payer: "tenant",
			});
		}

		// --- LISTER PAYMENT (2.5% + 1% if card) ---
		if (isLister) {
			const listerPaid = contract.listerPaymentStatus === "SUCCEEDED" || contract.listerStripePaymentStatus === "succeeded";
			if (listerPaid) {
				return res.status(409).json({
					message: "You have already paid your service fee.",
					listerPaymentStatus: "SUCCEEDED",
				});
			}

			const amountCents = Math.max(50, snapshot.listerFeeCents + snapshot.cardSurchargeCents);

			if (contract.listerStripePaymentIntentId && contract.listerStripePaymentStatus !== "succeeded") {
				try {
					const pi = await getStripe().paymentIntents.retrieve(contract.listerStripePaymentIntentId);
					const piMethod = pi.payment_method_types?.[0];
					const wantsAch = method === "ach";
					const piMatchesMethod =
						(wantsAch && piMethod === "us_bank_account") || (!wantsAch && piMethod === "card");
					if (pi.status !== "succeeded" && pi.status !== "canceled" && piMatchesMethod) {
						return res.status(200).json({
							clientSecret: pi.client_secret,
							paymentIntentId: pi.id,
							amountCents,
							paymentStatus: contract.listerPaymentStatus || "PENDING",
							paymentSnapshot: { ...snapshot, amountToChargeCents: amountCents },
							payer: "lister",
						});
					}
					if (pi.status !== "succeeded" && pi.status !== "canceled" && !piMatchesMethod) {
						await getStripe().paymentIntents.cancel(pi.id).catch(() => {});
						contract.listerStripePaymentIntentId = undefined;
						contract.listerStripePaymentStatus = "";
					}
				} catch (e) { /* ignore */ }
			}

			const { id, clientSecret } = await createPaymentIntent(
				amountCents,
				"usd",
				{
					contractId: contractId.toString(),
					tenantId: contract.tenant?._id?.toString(),
					listerId: contract.lister?._id?.toString(),
					payer: "lister",
				},
				contract.lister?.email,
				method
			);

			contract.listerStripePaymentIntentId = id;
			contract.listerStripePaymentStatus = "pending";
			contract.listerPaymentStatus = "PENDING";
			await contract.save();

			return res.status(200).json({
				clientSecret,
				paymentIntentId: id,
				amountCents,
				paymentStatus: contract.listerPaymentStatus,
				paymentSnapshot: { ...snapshot, amountToChargeCents: amountCents },
				payer: "lister",
			});
		}
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
				const payer = (pi.metadata && pi.metadata.payer) || "tenant";
				if (!contractId) break;

				const update =
					payer === "lister"
						? { listerStripePaymentStatus: "succeeded", listerPaymentStatus: "SUCCEEDED" }
						: { stripePaymentStatus: "succeeded", paymentStatus: "SUCCEEDED" };

				await Contract.findOneAndUpdate({ _id: contractId }, update);
				console.log(`Contract ${contractId} ${payer} payment succeeded`);

				await markPropertyLeaseTakenOverIfBothPaid(contractId);

				// Notify counterparty and payer when payment succeeds
				try {
					const contract = await Contract.findById(contractId)
						.populate("property", "overview.title")
						.populate("lister", "_id name")
						.populate("tenant", "_id name");
					if (contract) {
						const propertyTitle =
							contract.property?.overview?.title ||
							`${contract.property?.listingDetails?.bedrooms || ""} Bed ${contract.property?.overview?.category || "Property"}`.trim();
						const link = `/dashboard/agreements/${contract._id}/sign`;
						const metadata = { contractId: contract._id, propertyId: contract.property?._id };

						// Notify counterparty (lister when tenant pays, tenant when lister pays)
						if (payer === "tenant" && contract?.lister?._id) {
							const message = `${contract.tenant?.name || "The sublessee"} has paid for the sublease agreement for ${propertyTitle}.`;
							await Notification.create({
								userId: contract.lister._id,
								type: "contract_payment_received",
								message,
								link,
								metadata: { ...metadata, tenantId: contract.tenant?._id },
							});
							await queueNotificationEmail(contract.lister._id, "contract_payment_received", { message, link, metadata });
						} else if (payer === "lister" && contract?.tenant?._id) {
							const message = `The sublessor has paid for the agreement for ${propertyTitle}. The agreement is now fully complete.`;
							await Notification.create({
								userId: contract.tenant._id,
								type: "contract_payment_received",
								message,
								link,
								metadata: { ...metadata, listerId: contract.lister?._id },
							});
							await queueNotificationEmail(contract.tenant._id, "contract_payment_received", { message, link, metadata });
						}

						// Notify payer that their payment completed
						const payerId = payer === "lister" ? contract.lister?._id : contract.tenant?._id;
						if (payerId) {
							const payerMessage = "Your service fee payment has been completed.";
							await Notification.create({
								userId: payerId,
								type: "contract_payment_received",
								message: payerMessage,
								link,
								metadata,
							});
							await queueNotificationEmail(payerId, "contract_payment_received", { message: payerMessage, link, metadata });
						}
					}
				} catch (notifErr) {
					console.error("Webhook: payment notification failed", notifErr.message);
				}
				break;
			}
			case "payment_intent.processing": {
				const pi = event.data.object;
				const contractId = pi.metadata?.contractId;
				const payer = pi.metadata?.payer || "tenant";
				if (!contractId) break;
				const update = payer === "lister"
					? { listerStripePaymentStatus: "processing", listerPaymentStatus: "PROCESSING" }
					: { stripePaymentStatus: "processing", paymentStatus: "PROCESSING" };
				await Contract.findOneAndUpdate({ _id: contractId }, update);
				// Notify payer that bank transfer is processing
				try {
					const contract = await Contract.findById(contractId)
						.populate("lister", "_id")
						.populate("tenant", "_id");
					if (contract) {
						const recipientId = payer === "lister" ? contract.lister?._id : contract.tenant?._id;
						if (recipientId) {
							const message = "Your bank transfer has been received and is being processed. You'll be notified when it completes.";
							const link = `/dashboard/agreements/${contract._id}/sign`;
							const metadata = { contractId: contract._id, propertyId: contract.property };
							await Notification.create({
								userId: recipientId,
								type: "contract_payment_received",
								message,
								link,
								metadata,
							});
							await queueNotificationEmail(recipientId, "contract_payment_received", { message, link, metadata });
						}
					}
				} catch (notifErr) {
					console.error("Webhook: payment processing notification failed", notifErr.message);
				}
				break;
			}
			case "payment_intent.canceled": {
				const pi = event.data.object;
				const contractId = pi.metadata?.contractId;
				const payer = pi.metadata?.payer || "tenant";
				if (!contractId) break;
				const update = payer === "lister"
					? { listerStripePaymentStatus: "canceled", listerPaymentStatus: "CANCELED" }
					: { stripePaymentStatus: "canceled", paymentStatus: "CANCELED" };
				await Contract.findOneAndUpdate({ _id: contractId }, update);
				break;
			}
			case "payment_intent.payment_failed": {
				const pi = event.data.object;
				const contractId = pi.metadata?.contractId;
				const payer = pi.metadata?.payer || "tenant";
				if (!contractId) break;
				const update = payer === "lister"
					? { listerStripePaymentStatus: "failed", listerPaymentStatus: "FAILED" }
					: { stripePaymentStatus: "failed", paymentStatus: "FAILED" };
				await Contract.findOneAndUpdate({ _id: contractId }, update);
				console.log(`Contract ${contractId} ${payer} payment failed`);
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
