const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Contract = require("../models/contractModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const { generateContractPdf } = require("../services/pdfService");
const {
	SUBLEASE_AGREEMENT_V2_HTML,
	getDefaultVariables,
} = require("../templates/subleaseAgreementTemplate");
const Notification = require("../models/notificationModel");
const { sendTransactionalEmail } = require("../services/emailService");
const { queueNotificationEmail } = require("../utils/notificationEmailHelper");
const { getStripe } = require("../services/stripeService");

// Configure DigitalOcean Spaces client using AWS SDK v3
// Note: SDK v3 requires the full endpoint URL including the protocol
const spacesEndpoint =
	process.env.SPACES_ENDPOINT || "nyc3.digitaloceanspaces.com";

const s3Client = new S3Client({
	endpoint: `https://${spacesEndpoint}`,
	region: "us-east-1", // Mandatory parameter for the SDK, even if using Spaces
	credentials: {
		accessKeyId: process.env.SPACES_KEY,
		secretAccessKey: process.env.SPACES_SECRET,
	},
});

const BUCKET_NAME = process.env.SPACES_BUCKET || "propertyimages";

/**
 * Uploads a file buffer to DigitalOcean Spaces.
 * Returns the public URL of the uploaded file.
 * * @param {Buffer} buffer - The file content
 * @param {string} filename - The key/path for the file in storage
 * @param {string} contentType - The MIME type of the file
 */
const uploadToSpaces = async (buffer, filename, contentType) => {
	const params = {
		Bucket: BUCKET_NAME,
		Key: filename,
		Body: buffer,
		ACL: "public-read", // Ensures the file is publicly accessible
		ContentType: contentType,
	};

	try {
		const command = new PutObjectCommand(params);
		await s3Client.send(command);

		// Construct the URL manually as PutObjectCommand does not return the location in V3
		return `https://${BUCKET_NAME}.${spacesEndpoint}/${filename}`;
	} catch (error) {
		console.error("Storage Upload Error:", error);
		throw new Error("Failed to upload file to storage system");
	}
};

/**
 * Initiates a new contract draft between a lister and a tenant.
 * Validates ownership and checks for existing active contracts.
 */
exports.createDraft = async (req, res) => {
	try {
		const { propertyId, tenantId } = req.body;
		const listerId = req.user.userId;

		// Verify property ownership
		const property = await Property.findOne({
			_id: propertyId,
			userId: listerId,
		});

		if (!property) {
			return res.status(404).json({
				message: "Property not found or access denied.",
			});
		}

		// Prevent duplicate active contracts
		const existingContract = await Contract.findOne({
			property: propertyId,
			tenant: tenantId,
			status: {
				$in: [
					"DRAFT",
					"PENDING_TENANT_SIGNATURE",
					"PENDING_LISTER_SIGNATURE",
				],
			},
		});

		if (existingContract) {
			const populated = await Contract.findById(existingContract._id)
				.populate(
					"property",
					"overview addressAndLocation.address images listingDetails.bedrooms"
				)
				.populate("lister", "name email phone")
				.populate("tenant", "name email phone");
			return res.status(200).json(populated);
		}

		// Fetch lister and tenant for pre-filling contract variables
		const [lister, tenant] = await Promise.all([
			User.findById(listerId).select("name email phone").lean(),
			User.findById(tenantId).select("name email phone").lean(),
		]);

		// Use v2 Sublease Agreement template (Burrow Housing Limited Sublease Agreement v2)
		const defaultVariables = getDefaultVariables(property, lister, tenant);

		const contract = await Contract.create({
			property: propertyId,
			lister: listerId,
			tenant: tenantId,
			templateHtml: SUBLEASE_AGREEMENT_V2_HTML,
			variables: defaultVariables,
		});

		// Populate related fields while keeping all other fields
		const populatedContract = await Contract.findById(contract._id)
			.populate(
				"property",
				"overview addressAndLocation.address images listingDetails.bedrooms"
			)
			.populate("lister", "name email phone")
			.populate("tenant", "name email phone");

		res.status(201).json(populatedContract);
	} catch (error) {
		console.error("Error creating draft:", error);
		res.status(500).json({
			message: "Server Error",
			error: error.message,
		});
	}
};

/**
 * Get contract for a chat context (property + counterparty).
 * Used to show agreement status/banner inside chat.
 * GET /contracts/by-chat?propertyId=...&counterpartyId=...
 */
exports.getContractByChat = async (req, res) => {
	try {
		const userId = req.user.userId;
		const { propertyId, counterpartyId } = req.query;

		if (!propertyId || !counterpartyId) {
			return res.status(400).json({
				message: "propertyId and counterpartyId are required.",
			});
		}

		// Contract exists where current user and counterparty are lister/tenant (either order) for this property
		const contract = await Contract.findOne({
			property: propertyId,
			$or: [
				{ lister: userId, tenant: counterpartyId },
				{ lister: counterpartyId, tenant: userId },
			],
			status: { $in: ["DRAFT", "PENDING_TENANT_SIGNATURE", "PENDING_LISTER_SIGNATURE", "COMPLETED"] },
		})
			.populate("property", "overview.title")
			.select("_id status")
			.lean();

		res.json(contract || null);
	} catch (error) {
		console.error("Error fetching contract by chat:", error);
		res.status(500).json({ message: "Server Error", error: error.message });
	}
};

/**
 * Retrieves all agreements associated with the authenticated user
 * (either as a lister or a tenant).
 */
exports.getMyAgreements = async (req, res) => {
	try {
		const userId = req.user.userId;

		const contracts = await Contract.find({
			$or: [{ lister: userId }, { tenant: userId }],
		})
			.populate(
				"property",
				"overview addressAndLocation.address images listingDetails.bedrooms"
			)
			.populate("lister", "name email phone")
			.populate("tenant", "name email phone")
			.sort({ updatedAt: -1 });

		res.json(contracts);
	} catch (error) {
		console.error("Error fetching agreements:", error);
		res.status(500).json({
			message: "Server Error",
			error: error.message,
		});
	}
};

/**
 * Create payment notification for counterparty when payer has completed payment.
 */
async function createPaymentNotification(contract, payer) {
	try {
		const propertyTitle =
			contract.property?.overview?.title ||
			`${contract.property?.listingDetails?.bedrooms || ""} Bed ${contract.property?.overview?.category || "Property"}`.trim();
		const contractId = contract._id?.toString?.() || contract._id;
		const link = `/dashboard/agreements/${contractId}/sign`;
		const metadata = { contractId: contract._id, propertyId: contract.property?._id };

		if (payer === "tenant") {
			const recipientId = contract.lister?._id || contract.lister;
			if (!recipientId) return;
			const message = `${contract.tenant?.name || "The sublessee"} has paid for the sublease agreement for ${propertyTitle}.`;
			await Notification.create({
				userId: recipientId,
				type: "contract_payment_received",
				message,
				link,
				metadata: { ...metadata, tenantId: contract.tenant?._id || contract.tenant },
			});
			await queueNotificationEmail(recipientId, "contract_payment_received", { message, link, metadata });
		} else if (payer === "lister") {
			const recipientId = contract.tenant?._id || contract.tenant;
			if (!recipientId) return;
			const message = `The sublessor has paid for the agreement for ${propertyTitle}. The agreement is now fully complete.`;
			await Notification.create({
				userId: recipientId,
				type: "contract_payment_received",
				message,
				link,
				metadata: { ...metadata, listerId: contract.lister?._id || contract.lister },
			});
			await queueNotificationEmail(recipientId, "contract_payment_received", { message, link, metadata });
		}
	} catch (e) {
		console.warn("createPaymentNotification:", e.message);
	}
}

/**
 * Create payment notification for the payer (processing or completed).
 */
async function createPaymentPayerNotification(contract, payer, status) {
	try {
		const contractId = contract._id?.toString?.() || contract._id;
		const link = `/dashboard/agreements/${contractId}/sign`;
		const metadata = { contractId: contract._id, propertyId: contract.property?._id };
		const recipientId = payer === "tenant" ? (contract.tenant?._id || contract.tenant) : (contract.lister?._id || contract.lister);
		if (!recipientId) return;

		const message = status === "processing"
			? "Your bank transfer has been received and is being processed. You'll be notified when it completes."
			: "Your service fee payment has been completed.";

		await Notification.create({
			userId: recipientId,
			type: "contract_payment_received",
			message,
			link,
			metadata,
		});
		await queueNotificationEmail(recipientId, "contract_payment_received", { message, link, metadata });
	} catch (e) {
		console.warn("createPaymentPayerNotification:", e.message);
	}
}

/**
 * Syncs payment status from Stripe when webhook hasn't fired (e.g. local dev).
 * Creates notifications using same template as webhook.
 */
async function syncPaymentStatusFromStripe(contract) {
	let updated = false;
	try {
		if (contract.stripePaymentIntentId && contract.stripePaymentStatus !== "succeeded") {
			const pi = await getStripe().paymentIntents.retrieve(contract.stripePaymentIntentId);
			if (pi.status === "succeeded") {
				contract.stripePaymentStatus = "succeeded";
				contract.paymentStatus = "SUCCEEDED";
				updated = true;
				await createPaymentNotification(contract, "tenant");
				await createPaymentPayerNotification(contract, "tenant", "succeeded");
			} else if (pi.status === "processing") {
				const wasAlreadyProcessing = contract.stripePaymentStatus === "processing";
				contract.stripePaymentStatus = "processing";
				contract.paymentStatus = "PROCESSING";
				updated = true;
				if (!wasAlreadyProcessing) await createPaymentPayerNotification(contract, "tenant", "processing");
			} else if (pi.status === "canceled" || pi.status === "cancelled") {
				contract.stripePaymentStatus = "canceled";
				contract.paymentStatus = "CANCELED";
				updated = true;
			} else if (pi.status === "requires_payment_method") {
				contract.stripePaymentStatus = "failed";
				contract.paymentStatus = "FAILED";
				updated = true;
			}
		}
		if (contract.listerStripePaymentIntentId && contract.listerStripePaymentStatus !== "succeeded") {
			const pi = await getStripe().paymentIntents.retrieve(contract.listerStripePaymentIntentId);
			if (pi.status === "succeeded") {
				contract.listerStripePaymentStatus = "succeeded";
				contract.listerPaymentStatus = "SUCCEEDED";
				updated = true;
				await createPaymentNotification(contract, "lister");
				await createPaymentPayerNotification(contract, "lister", "succeeded");
			} else if (pi.status === "processing") {
				const wasAlreadyProcessing = contract.listerStripePaymentStatus === "processing";
				contract.listerStripePaymentStatus = "processing";
				contract.listerPaymentStatus = "PROCESSING";
				updated = true;
				if (!wasAlreadyProcessing) await createPaymentPayerNotification(contract, "lister", "processing");
			} else if (pi.status === "canceled" || pi.status === "cancelled") {
				contract.listerStripePaymentStatus = "canceled";
				contract.listerPaymentStatus = "CANCELED";
				updated = true;
			} else if (pi.status === "requires_payment_method") {
				contract.listerStripePaymentStatus = "failed";
				contract.listerPaymentStatus = "FAILED";
				updated = true;
			}
		}
		if (updated) {
			try {
				await contract.save();
				await markPropertyLeaseTakenOverIfBothPaid(contract);
			} catch (saveErr) {
				console.warn("syncPaymentStatusFromStripe: save failed, returning DB state", saveErr.message);
				// Re-fetch from DB so we never return unsaved modifications
				const fresh = await Contract.findById(contract._id)
					.populate("property", "overview addressAndLocation.address images listingDetails.bedrooms")
					.populate("lister", "name email phone")
					.populate("tenant", "name email phone");
				return fresh || contract;
			}
		}
	} catch (e) {
		console.warn("syncPaymentStatusFromStripe:", e.message);
		// On any error after in-place modifications, re-fetch to avoid returning unsaved state
		try {
			const fresh = await Contract.findById(contract._id)
				.populate("property", "overview addressAndLocation.address images listingDetails.bedrooms")
				.populate("lister", "name email phone")
				.populate("tenant", "name email phone");
			return fresh || contract;
		} catch (rethrow) {
			return contract;
		}
	}
	return contract;
}

/** If contract is COMPLETED and both parties have paid, mark the property as lease taken over. */
async function markPropertyLeaseTakenOverIfBothPaid(contract) {
	try {
		if (!contract || contract.status !== "COMPLETED" || !contract.property) return;
		const tenantPaid = contract.paymentStatus === "SUCCEEDED" || contract.stripePaymentStatus === "succeeded";
		const listerPaid = contract.listerPaymentStatus === "SUCCEEDED" || contract.listerStripePaymentStatus === "succeeded";
		if (tenantPaid && listerPaid) {
			await Property.findByIdAndUpdate(contract.property, {
				leaseTakenOver: true,
				status: "Inactive",
			});
			console.log(`Property ${contract.property} marked as lease taken over and deactivated`);
		}
	} catch (e) {
		console.warn("markPropertyLeaseTakenOverIfBothPaid:", e.message);
	}
}

/**
 * Retrieves a single contract by ID.
 * Enforces security to ensure only participants can view the details.
 */
exports.getContractById = async (req, res) => {
	try {
		const contract = await Contract.findById(req.params.id)
			.populate(
				"property",
				"overview addressAndLocation.address images listingDetails.bedrooms"
			)
			.populate("lister", "name email phone")
			.populate("tenant", "name email phone");

		if (!contract)
			return res
				.status(404)
				.json({ message: "Contract not found" });

		const userId = req.user.userId;
		const isParticipant =
			contract.lister._id.toString() === userId ||
			contract.tenant._id.toString() === userId;

		if (!isParticipant) {
			return res.status(403).json({
				message: "Not authorized to view this contract.",
			});
		}

		// Sync payment status from Stripe (works when webhook hasn't fired, e.g. local dev)
		let syncedContract = contract;
		if (process.env.STRIPE_SECRET_KEY) {
			syncedContract = await syncPaymentStatusFromStripe(contract);
		}

		res.json(syncedContract);
	} catch (error) {
		console.error("Error fetching contract:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

/**
 * Updates the draft content and variables.
 * Restricted to the lister and only allowed when status is DRAFT.
 */
exports.updateDraft = async (req, res) => {
	try {
		const { templateHtml, variables } = req.body;
		const contract = await Contract.findById(req.params.id);

		if (!contract)
			return res
				.status(404)
				.json({ message: "Contract not found" });

		if (contract.lister.toString() !== req.user.userId) {
			return res.status(403).json({
				message: "Only the lister can edit the contract.",
			});
		}
		if (contract.status !== "DRAFT") {
			return res.status(400).json({
				message: "Cannot edit a locked contract.",
			});
		}

		contract.templateHtml = templateHtml;
		contract.variables = variables;
		await contract.save();

		// Populate before sending response
		const populatedContract = await Contract.findById(contract._id)
			.populate(
				"property",
				"overview addressAndLocation.address images listingDetails.bedrooms"
			)
			.populate("lister", "name email phone")
			.populate("tenant", "name email phone");

		res.json(populatedContract);
	} catch (error) {
		console.error("Error updating draft:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

/**
 * Locks the contract and transitions status from DRAFT to PENDING_TENANT_SIGNATURE.
 * Restricted to the lister only.
 */
exports.lockContract = async (req, res) => {
	try {
		const contract = await Contract.findById(req.params.id);

		if (!contract) {
			return res
				.status(404)
				.json({ message: "Contract not found" });
		}

		// Security: Only lister can lock
		if (contract.lister.toString() !== req.user.userId) {
			return res.status(403).json({
				message: "Only the lister can finalize the contract.",
			});
		}

		// Status validation
		if (contract.status !== "DRAFT") {
			return res.status(400).json({
				message: "Contract is already locked.",
			});
		}

		// Lock the contract
		contract.status = "PENDING_TENANT_SIGNATURE";
		await contract.save();

		// Populate before sending response
		const populatedContract = await Contract.findById(contract._id)
			.populate(
				"property",
				"overview addressAndLocation.address images listingDetails.bedrooms"
			)
			.populate("lister", "name email phone")
			.populate("tenant", "name email phone");

		// Notification + email: non-fatal so lock always returns success
		const _getVar = (v, key) => (v && typeof v.get === "function" ? v.get(key) : (v && v[key]));
		const propertyTitle =
			populatedContract.property?.overview?.title ||
			`${
				populatedContract.property?.listingDetails?.bedrooms || ""
			} Bed ${
				populatedContract.property?.overview?.category || "Property"
			}`.trim();
		const reviewUrl = `http://www.burrowhousing.com/dashboard/agreements/${populatedContract._id}/sign`;

		try {
			await Notification.create({
				userId: populatedContract.tenant._id,
				type: "contract_pending",
				message: `${populatedContract.lister.name} has sent you a sublease agreement for ${propertyTitle}`,
				link: `/dashboard/agreements/${populatedContract._id}/sign`,
				metadata: {
					contractId: populatedContract._id,
					propertyId: populatedContract.property?._id,
					listerId: populatedContract.lister._id,
				},
			});
		} catch (notifErr) {
			console.error("Lock: notification create failed", notifErr.message);
		}

		try {
			await sendTransactionalEmail(
				4,
				populatedContract.tenant.email,
				populatedContract.tenant.name,
				{
					tenant_name: populatedContract.tenant.name,
					lister_name: populatedContract.lister.name,
					property_title: propertyTitle,
					property_address:
						populatedContract.property?.addressAndLocation?.address ||
						"Address not available",
					rent_amount: _getVar(populatedContract.variables, "Rent_Amount") || "TBD",
					start_date: _getVar(populatedContract.variables, "Start_Date") || "TBD",
					end_date: _getVar(populatedContract.variables, "End_Date") || "TBD",
					review_url: reviewUrl,
				}
			);
		} catch (emailErr) {
			console.error("Lock: sendTransactionalEmail failed", emailErr.message);
		}

		res.json(populatedContract);
	} catch (error) {
		console.error("Error locking contract:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

/**
 * Handles the signing process for both Tenant and Lister.
 * - Tenant signature moves status to PENDING_LISTER_SIGNATURE.
 * - Lister signature generates the final PDF, uploads it, and marks property as Rented.
 */
const _getVar = (v, key) =>
	v && typeof v.get === "function" ? v.get(key) : v && v[key];

exports.signContract = async (req, res) => {
	try {
		const { signatureData } = req.body; // Expects Base64 string
		const userId = req.user.userId;
		const contractId = req.params.id;

		if (!signatureData || typeof signatureData !== "string") {
			return res.status(400).json({
				message: "Signature data is required (Base64 image string).",
			});
		}

		const contract = await Contract.findById(contractId);
		if (!contract)
			return res
				.status(404)
				.json({ message: "Contract not found" });

		const isTenant = contract.tenant.toString() === userId;
		const isLister = contract.lister.toString() === userId;

		if (!isTenant && !isLister) {
			return res.status(403).json({
				message: "Not authorized to sign this contract.",
			});
		}

		// Tenant Execution Block
		if (isTenant) {
			if (contract.status !== "PENDING_TENANT_SIGNATURE") {
				return res.status(400).json({
					message: "It is not currently your turn to sign.",
				});
			}

			// Decode Base64 and Upload
			const base64Image = signatureData.split(";base64,").pop() || signatureData.trim();
			if (!base64Image) {
				return res.status(400).json({ message: "Invalid signature data: expected Base64 image." });
			}
			const buffer = Buffer.from(base64Image, "base64");
			if (buffer.length === 0) {
				return res.status(400).json({ message: "Invalid signature data: could not decode Base64." });
			}
			const sigUrl = await uploadToSpaces(
				buffer,
				`signatures/tenant_${contractId}_${Date.now()}.png`,
				"image/png"
			);

			contract.tenantSignature = {
				url: sigUrl,
				signedAt: new Date(),
				ipAddress: req.ip,
			};
			contract.status = "PENDING_LISTER_SIGNATURE";
			await contract.save();

			// Populate before sending response
			const populatedContract = await Contract.findById(
				contract._id
			)
				.populate(
					"property",
					"overview.title addressAndLocation.address images listingDetails.bedrooms"
				)
				.populate("lister", "name email phone")
				.populate("tenant", "name email phone");

			// Notification + email: non-fatal
			const propertyTitle =
				populatedContract.property?.overview?.title ||
				`${
					populatedContract.property?.listingDetails?.bedrooms || ""
				} Bed ${
					populatedContract.property?.overview?.category || "Property"
				}`.trim();
			const countersignUrl = `http://www.burrowhousing.com/dashboard/agreements/${contractId}/sign`;

			try {
				await Notification.create({
					userId: populatedContract.lister._id,
					type: "contract_tenant_signed",
					message: `${populatedContract.tenant.name} has signed the sublease agreement for ${propertyTitle}. Countersign to finalize.`,
					link: `/dashboard/agreements/${populatedContract._id}/sign`,
					metadata: {
						contractId: populatedContract._id,
						propertyId: populatedContract.property?._id,
						tenantId: populatedContract.tenant._id,
					},
				});
			} catch (notifErr) {
				console.error("Sign (tenant): notification create failed", notifErr.message);
			}
			try {
				await sendTransactionalEmail(
					5,
					populatedContract.lister.email,
					populatedContract.lister.name,
					{
						lister_name: populatedContract.lister.name,
						tenant_name: populatedContract.tenant.name,
						property_title: propertyTitle,
						signed_date: new Date().toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						}),
						countersign_url: countersignUrl,
					}
				);
			} catch (emailErr) {
				console.error("Sign (tenant): sendTransactionalEmail failed", emailErr.message);
			}

			return res.json(populatedContract);
		}

		// Lister Execution Block (Finalization)
		if (isLister) {
			if (contract.status !== "PENDING_LISTER_SIGNATURE") {
				return res.status(400).json({
					message: "Waiting for tenant signature first.",
				});
			}

			// Upload Lister Signature
			const base64ImageLister = signatureData.split(";base64,").pop() || signatureData.trim();
			if (!base64ImageLister) {
				return res.status(400).json({ message: "Invalid signature data: expected Base64 image." });
			}
			const bufferLister = Buffer.from(base64ImageLister, "base64");
			if (bufferLister.length === 0) {
				return res.status(400).json({ message: "Invalid signature data: could not decode Base64." });
			}
			const sigUrl = await uploadToSpaces(
				bufferLister,
				`signatures/lister_${contractId}_${Date.now()}.png`,
				"image/png"
			);

			contract.listerSignature = {
				url: sigUrl,
				signedAt: new Date(),
				ipAddress: req.ip,
			};

			// Prepare HTML for PDF Generation (Inject variables). Support Map or plain object.
			let finalHtml = contract.templateHtml;
			const vars = contract.variables;
			if (vars) {
				const entries =
					typeof vars.forEach === "function"
						? [...vars.entries()]
						: Object.entries(vars);
				entries.forEach(([key, value]) => {
					finalHtml = finalHtml.split(`{{${key}}}`).join(value ?? "");
				});
			}

			// Generate PDF Buffer
			const pdfBuffer = await generateContractPdf(
				finalHtml,
				contract.tenantSignature.url,
				sigUrl
			);

			// Upload Final PDF
			const pdfUrl = await uploadToSpaces(
				pdfBuffer,
				`contracts/contract_${contractId}_final.pdf`,
				"application/pdf"
			);

			contract.finalPdfUrl = pdfUrl;
			contract.status = "COMPLETED";

			// Payment window starts when both parties have signed.
			// Enforced by Stripe controller when tenant tries to pay.
			const paymentWindowHours = Number.parseInt(
				process.env.PAYMENT_WINDOW_HOURS || "48",
				10
			);
			const hours = Number.isFinite(paymentWindowHours)
				? paymentWindowHours
				: 48;
			contract.paymentStatus = "NOT_STARTED";
			contract.payoutStatus = "NOT_STARTED";
			contract.paymentExpiresAt = new Date(
				Date.now() + hours * 60 * 60 * 1000
			);
			await contract.save();

			// Update Property Inventory Status: Inactive = off market; leaseTakenOver = "Rented" display.
			// When Stripe is disabled, we mark as rented when both sign. When enabled, markPropertyLeaseTakenOverIfBothPaid handles it after both pay.
			await Property.findByIdAndUpdate(contract.property, {
				status: "Inactive",
				leaseTakenOver: true,
			});

			const populatedContract = await Contract.findById(
				contract._id
			)
				.populate(
					"property",
					"overview addressAndLocation.address images listingDetails.bedrooms"
				)
				.populate("lister", "name email phone")
				.populate("tenant", "name email phone");

			// Notifications + emails: non-fatal so sign always returns success
			const propertyTitle =
				populatedContract.property?.overview?.title ||
				`${
					populatedContract.property?.listingDetails?.bedrooms || ""
				} Bed ${
					populatedContract.property?.overview?.category || "Property"
				}`.trim();
			const v = populatedContract.variables;
			const emailParams = {
				property_title: propertyTitle,
				lister_name: populatedContract.lister.name,
				tenant_name: populatedContract.tenant.name,
				start_date: _getVar(v, "Start_Date") || "TBD",
				end_date: _getVar(v, "End_Date") || "TBD",
				rent_amount: _getVar(v, "Rent_Amount") || "TBD",
				pdf_url: populatedContract.finalPdfUrl,
			};

			try {
				await Notification.create({
					userId: populatedContract.tenant._id,
					type: "contract_completed",
					message: `Your sublease agreement for ${propertyTitle} is now complete! You can pay rent when ready.`,
					link: `/dashboard/agreements/${populatedContract._id}/sign`,
					metadata: {
						contractId: populatedContract._id,
						propertyId: populatedContract.property?._id,
					},
				});
			} catch (notifErr) {
				console.error("Sign (lister): tenant notification failed", notifErr.message);
			}
			try {
				await Notification.create({
					userId: populatedContract.lister._id,
					type: "contract_completed",
					message: `The sublease agreement for ${propertyTitle} is now complete! The sublessee will be prompted to pay.`,
					link: `/dashboard/my-agreements`,
					metadata: {
						contractId: populatedContract._id,
						propertyId: populatedContract.property?._id,
					},
				});
			} catch (notifErr) {
				console.error("Sign (lister): lister notification failed", notifErr.message);
			}
			try {
				await sendTransactionalEmail(
					6,
					populatedContract.tenant.email,
					populatedContract.tenant.name,
					{ ...emailParams, user_name: populatedContract.tenant.name }
				);
			} catch (emailErr) {
				console.error("Sign (lister): email to tenant failed", emailErr.message);
			}
			try {
				await sendTransactionalEmail(
					6,
					populatedContract.lister.email,
					populatedContract.lister.name,
					{ ...emailParams, user_name: populatedContract.lister.name }
				);
			} catch (emailErr) {
				console.error("Sign (lister): email to lister failed", emailErr.message);
			}

			return res.json(populatedContract);
		}
	} catch (error) {
		console.error("Signing Error:", error);
		const message =
			error.code === "CredentialsError" || error.message?.includes("upload")
				? "Storage upload failed. Check Spaces/S3 configuration."
				: error.message || "Error processing signature";
		res.status(500).json({
			message: "Error processing signature",
			error: process.env.NODE_ENV === "development" ? message : "Error processing signature",
		});
	}
};

/**
 * Recalls a contract from PENDING_TENANT_SIGNATURE back to DRAFT.
 * Allows the lister to edit terms before the tenant signs (for negotiations).
 * Only the lister can recall; only when status is PENDING_TENANT_SIGNATURE.
 */
exports.recallContract = async (req, res) => {
	try {
		const contract = await Contract.findById(req.params.id);

		if (!contract) {
			return res
				.status(404)
				.json({ message: "Contract not found" });
		}

		if (contract.lister.toString() !== req.user.userId) {
			return res.status(403).json({
				message: "Only the lister can recall this contract.",
			});
		}

		if (contract.status !== "PENDING_TENANT_SIGNATURE") {
			return res.status(400).json({
				message: "Contract can only be recalled when it is pending tenant signature.",
			});
		}

		contract.status = "DRAFT";
		await contract.save();

		const populatedContract = await Contract.findById(contract._id)
			.populate(
				"property",
				"overview addressAndLocation.address images listingDetails.bedrooms"
			)
			.populate("lister", "name email phone")
			.populate("tenant", "name email phone");

		res.json(populatedContract);
	} catch (error) {
		console.error("Error recalling contract:", error);
		res.status(500).json({
			message: "Server Error",
			error: error.message,
		});
	}
};

/**
 * Deletes or cancels a contract.
 * Lister can delete DRAFT contracts or cancel contracts waiting for signatures.
 * Tenant can decline/cancel when status is PENDING_TENANT_SIGNATURE.
 * Cannot delete/cancel contracts that have been signed by both parties.
 */
exports.deleteContract = async (req, res) => {
	try {
		const contract = await Contract.findById(req.params.id);

		if (!contract) {
			return res
				.status(404)
				.json({ message: "Contract not found" });
		}

		if (contract.status === "COMPLETED") {
			return res.status(400).json({
				message: "Cannot delete completed contracts. Both parties have signed.",
			});
		}

		const userId = req.user.userId.toString();
		const isLister = contract.lister.toString() === userId;
		const isTenant = contract.tenant.toString() === userId;

		// Lister can delete/cancel any non-completed contract
		// Tenant can cancel only when pending their signature (they are declining)
		if (isLister) {
			// Lister cancelling – notify tenant if not draft
			if (contract.status !== "DRAFT") {
				try {
					const populated = await Contract.findById(contract._id)
						.populate("property", "overview.title")
						.populate("lister", "name")
						.populate("tenant", "_id");
					if (populated?.tenant?._id) {
						const propertyTitle =
							populated.property?.overview?.title ||
							`${populated.property?.listingDetails?.bedrooms || ""} Bed ${populated.property?.overview?.category || "Property"}`.trim();
						await Notification.create({
							userId: populated.tenant._id,
							type: "contract_cancelled",
							message: `The sublease agreement for ${propertyTitle} was cancelled by the sublessor.`,
							link: "/dashboard/my-agreements",
							metadata: {
								contractId: contract._id,
								propertyId: contract.property,
								listerId: contract.lister,
							},
						});
						await queueNotificationEmail(populated.tenant._id, "contract_cancelled", {
							message: `The sublease agreement for ${propertyTitle} was cancelled by the sublessor.`,
							link: "/dashboard/my-agreements",
							metadata: { contractId: contract._id, propertyId: contract.property },
						});
					}
				} catch (notifErr) {
					console.error("Delete: tenant notification failed", notifErr.message);
				}
			}
		} else if (isTenant && contract.status === "PENDING_TENANT_SIGNATURE") {
			// Tenant declining – notify lister
			try {
				const populated = await Contract.findById(contract._id)
					.populate("property", "overview.title")
					.populate("lister", "_id")
					.populate("tenant", "name");
				if (populated?.lister?._id) {
					const propertyTitle =
						populated.property?.overview?.title ||
						`${populated.property?.listingDetails?.bedrooms || ""} Bed ${populated.property?.overview?.category || "Property"}`.trim();
					await Notification.create({
						userId: populated.lister._id,
						type: "contract_cancelled",
						message: `${populated.tenant?.name || "The sublessee"} declined the sublease agreement for ${propertyTitle}.`,
						link: "/dashboard/my-agreements",
						metadata: {
							contractId: contract._id,
							propertyId: contract.property,
							tenantId: contract.tenant,
						},
					});
					await queueNotificationEmail(populated.lister._id, "contract_cancelled", {
						message: `${populated.tenant?.name || "The sublessee"} declined the sublease agreement for ${propertyTitle}.`,
						link: "/dashboard/my-agreements",
						metadata: { contractId: contract._id, propertyId: contract.property },
					});
				}
			} catch (notifErr) {
				console.error("Delete: lister notification failed", notifErr.message);
			}
		} else {
			return res.status(403).json({
				message: "You cannot cancel this contract.",
			});
		}

		await Contract.findByIdAndDelete(req.params.id);

		const action = contract.status === "DRAFT" ? "deleted" : "cancelled";
		res.json({ message: `Contract ${action} successfully` });
	} catch (error) {
		console.error("Error deleting contract:", error);
		res.status(500).json({ message: "Server Error" });
	}
};
