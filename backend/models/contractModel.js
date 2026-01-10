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
	},
	{ timestamps: true }
);

// Index for quick lookups by user
contractSchema.index({ lister: 1, status: 1 });
contractSchema.index({ tenant: 1, status: 1 });

module.exports = mongoose.model("Contract", contractSchema);
