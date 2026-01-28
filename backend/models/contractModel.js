const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
	{
		// The Core Relationship
		property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property",
			required: true,
		},
		lister: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		tenant: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// Status Machine
		status: {
			type: String,
			enum: [
				"DRAFT", // Lister is editing terms
				"PENDING_TENANT_SIGNATURE", // Locked, waiting for tenant
				"PENDING_LISTER_SIGNATURE", // Tenant signed, waiting for lister
				"COMPLETED", // Both signed, PDF generated
				"CANCELLED",
			],
			default: "DRAFT",
		},

		// The Content
		// We store the 'body' of the contract here.
		templateHtml: {
			type: String,
			default: "<p>This sublease agreement is made between the Landlord and Tenant...</p>",
		},

		// Dynamic Variables (e.g., { "rent_amount": "1200", "start_date": "2024-05-01" })
		variables: {
			type: Map,
			of: String,
			default: {},
		},

		// Safety & Versioning
		liabilityWaiverVersion: {
			type: String,
			default: "v1.0",
		},

		// Signatures
		tenantSignature: {
			url: String, // S3 URL
			signedAt: Date,
			ipAddress: String,
		},
		listerSignature: {
			url: String, // S3 URL
			signedAt: Date,
			ipAddress: String,
		},

		// Final Artifact
		finalPdfUrl: {
			type: String, // S3 URL to the immutable PDF
		},

		// Stripe payment (when both sides have signed)
		stripePaymentIntentId: { type: String },
		stripePaymentStatus: {
			type: String,
			// Kept for backwards compatibility with existing frontend code.
			enum: ["", "pending", "succeeded", "failed", "canceled", "processing"],
			default: "",
		},

		/**
		 * Payment enforcement state machine (source of truth going forward).
		 * - Status machine above tracks signing.
		 * - These fields track money movement + clarity in UI/support.
		 */
		paymentStatus: {
			type: String,
			enum: [
				"NOT_STARTED",
				"PENDING",
				"PROCESSING",
				"SUCCEEDED",
				"FAILED",
				"CANCELED",
				"EXPIRED",
			],
			default: "NOT_STARTED",
		},
		payoutStatus: {
			type: String,
			enum: ["NOT_STARTED", "PENDING", "SENT", "FAILED", "REVERSED"],
			default: "NOT_STARTED",
		},
		paymentExpiresAt: { type: Date },

		// Immutable snapshot of what was charged at checkout time.
		paymentSnapshot: {
			rentCents: { type: Number, default: 0 }, // Base rent only (no deposit)
			tenantFeeCents: { type: Number, default: 0 }, // 2.5% (tenant side)
			listerFeeCents: { type: Number, default: 0 }, // 2.5% (lister side; deducted)
			cardSurchargeCents: { type: Number, default: 0 }, // +1.0% (tenant side; cards only)
			paymentMethod: {
				type: String,
				enum: ["card", "ach"],
				default: "card",
			},
			amountToChargeCents: { type: Number, default: 0 }, // what tenant pays
			amountToPayoutCents: { type: Number, default: 0 }, // what lister receives
		},
	},
	{ timestamps: true }
);

// Index for quick lookups by user
contractSchema.index({ lister: 1, status: 1 });
contractSchema.index({ tenant: 1, status: 1 });

module.exports = mongoose.model("Contract", contractSchema);
