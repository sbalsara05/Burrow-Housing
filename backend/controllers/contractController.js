const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Contract = require("../models/contractModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const { generateContractPdf } = require("../services/pdfService");
const Notification = require("../models/notificationModel");
const { sendTransactionalEmail } = require("../services/emailService");

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
			return res.status(200).json({
				message: "Active contract found",
				contract: existingContract,
			});
		}

		// Initialize default template
		const defaultTemplate = `
            <h3>Sublease Agreement</h3>
            <p>The tenant agrees to pay a monthly rent of <strong>{{Rent_Amount}}</strong>.</p>
            <p>Lease Start Date: <strong>{{Start_Date}}</strong></p>
            <p>Lease End Date: <strong>{{End_Date}}</strong></p>
        `;

		// Pre-fill variables from property details
		const defaultVariables = {
			Rent_Amount: property.overview?.rent
				? `$${property.overview.rent}`
				: "",
			Start_Date: "",
			End_Date: "",
		};

		const contract = await Contract.create({
			property: propertyId,
			lister: listerId,
			tenant: tenantId,
			templateHtml: defaultTemplate,
			variables: defaultVariables,
		});

		// Populate related fields while keeping all other fields
		const populatedContract = await Contract.findById(contract._id)
			.populate(
				"property",
				"overview addressAndLocation.address images listingDetails.bedrooms"
			)
			.populate("lister", "name email")
			.populate("tenant", "name email");

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
			.populate("lister", "name email")
			.populate("tenant", "name email")
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
			.populate("lister", "name email")
			.populate("tenant", "name email");

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

		res.json(contract);
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
			.populate("lister", "name email")
			.populate("tenant", "name email");

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
			.populate("lister", "name email")
			.populate("tenant", "name email");

		// Send notification to tenant
		const propertyTitle =
			populatedContract.property.overview?.title ||
			`${
				populatedContract.property.listingDetails
					?.bedrooms || ""
			} Bed ${
				populatedContract.property.overview?.category ||
				"Property"
			}`.trim();

		await Notification.create({
			userId: populatedContract.tenant._id,
			type: "contract_pending",
			message: `${populatedContract.lister.name} has sent you a sublease agreement for ${propertyTitle}`,
			link: `/dashboard/agreements/${populatedContract._id}/sign`,
			metadata: {
				contractId: populatedContract._id,
				propertyId: populatedContract.property._id,
				listerId: populatedContract.lister._id,
			},
		});

		// Send email to tenant
		const reviewUrl = `http://www.burrowhousing.com/dashboard/agreements/${populatedContract._id}/sign`;

		await sendTransactionalEmail(
			4,
			populatedContract.tenant.email,
			populatedContract.tenant.name,
			{
				tenant_name: populatedContract.tenant.name,
				lister_name: populatedContract.lister.name,
				property_title: propertyTitle,
				property_address:
					populatedContract.property
						.addressAndLocation?.address ||
					"Address not available",
				rent_amount:
					populatedContract.variables.get(
						"Rent_Amount"
					) || "TBD",
				start_date:
					populatedContract.variables.get(
						"Start_Date"
					) || "TBD",
				end_date:
					populatedContract.variables.get(
						"End_Date"
					) || "TBD",
				review_url: reviewUrl,
			}
		);

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
exports.signContract = async (req, res) => {
	try {
		const { signatureData } = req.body; // Expects Base64 string
		const userId = req.user.userId;
		const contractId = req.params.id;

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
			const base64Image = signatureData
				.split(";base64,")
				.pop();
			const buffer = Buffer.from(base64Image, "base64");
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
				.populate("lister", "name email")
				.populate("tenant", "name email");

			// Send notification to lister
			const propertyTitle =
				populatedContract.property.overview?.title ||
				`${
					populatedContract.property
						.listingDetails?.bedrooms || ""
				} Bed ${
					populatedContract.property.overview
						?.category || "Property"
				}`.trim();

			await Notification.create({
				userId: populatedContract.lister._id,
				type: "contract_tenant_signed",
				message: `${populatedContract.tenant.name} has signed the sublease agreement for ${propertyTitle}`,
				link: `/dashboard/agreements/${populatedContract._id}/sign`,
				metadata: {
					contractId: populatedContract._id,
					propertyId: populatedContract.property
						._id,
					tenantId: populatedContract.tenant._id,
				},
			});

			// Send email to lister
			const countersignUrl = `http://www.burrowhousing.com/dashboard/agreements/${contractId}/sign`;

			await sendTransactionalEmail(
				5,
				populatedContract.lister.email,
				populatedContract.lister.name,
				{
					lister_name:
						populatedContract.lister.name,
					tenant_name:
						populatedContract.tenant.name,
					property_title: propertyTitle,
					signed_date:
						new Date().toLocaleDateString(
							"en-US",
							{
								month: "long",
								day: "numeric",
								year: "numeric",
							}
						),
					countersign_url: countersignUrl,
				}
			);

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
			const base64Image = signatureData
				.split(";base64,")
				.pop();
			const buffer = Buffer.from(base64Image, "base64");
			const sigUrl = await uploadToSpaces(
				buffer,
				`signatures/lister_${contractId}_${Date.now()}.png`,
				"image/png"
			);

			contract.listerSignature = {
				url: sigUrl,
				signedAt: new Date(),
				ipAddress: req.ip,
			};

			// Prepare HTML for PDF Generation (Inject variables)
			let finalHtml = contract.templateHtml;
			if (contract.variables && contract.variables.size > 0) {
				contract.variables.forEach((value, key) => {
					finalHtml = finalHtml
						.split(`{{${key}}}`)
						.join(value);
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

			// Update Property Inventory Status
			await Property.findByIdAndUpdate(contract.property, {
				status: "Rented",
			});

			const populatedContract = await Contract.findById(
				contract._id
			)
				.populate(
					"property",
					"overview addressAndLocation.address images listingDetails.bedrooms"
				)
				.populate("lister", "name email")
				.populate("tenant", "name email");

			// Send notifications to both parties
			const propertyTitle =
				populatedContract.property.overview?.title ||
				`${
					populatedContract.property
						.listingDetails?.bedrooms || ""
				} Bed ${
					populatedContract.property.overview
						?.category || "Property"
				}`.trim();

			// Notification for tenant
			await Notification.create({
				userId: populatedContract.tenant._id,
				type: "contract_completed",
				message: `Your sublease agreement for ${propertyTitle} is now complete!`,
				link: `/dashboard/my-agreements`,
				metadata: {
					contractId: populatedContract._id,
					propertyId: populatedContract.property
						._id,
				},
			});

			// Notification for lister
			await Notification.create({
				userId: populatedContract.lister._id,
				type: "contract_completed",
				message: `The sublease agreement for ${propertyTitle} is now complete!`,
				link: `/dashboard/my-agreements`,
				metadata: {
					contractId: populatedContract._id,
					propertyId: populatedContract.property
						._id,
				},
			});

			// Email to both parties
			const emailParams = {
				property_title: propertyTitle,
				lister_name: populatedContract.lister.name,
				tenant_name: populatedContract.tenant.name,
				start_date:
					populatedContract.variables.get(
						"Start_Date"
					) || "TBD",
				end_date:
					populatedContract.variables.get(
						"End_Date"
					) || "TBD",
				rent_amount:
					populatedContract.variables.get(
						"Rent_Amount"
					) || "TBD",
				pdf_url: populatedContract.finalPdfUrl,
			};

			// Email to tenant
			await sendTransactionalEmail(
				6,
				populatedContract.tenant.email,
				populatedContract.tenant.name,
				{
					...emailParams,
					user_name: populatedContract.tenant
						.name,
				}
			);

			// Email to lister
			await sendTransactionalEmail(
				6,
				populatedContract.lister.email,
				populatedContract.lister.name,
				{
					...emailParams,
					user_name: populatedContract.lister
						.name,
				}
			);

			return res.json(populatedContract);
		}
	} catch (error) {
		console.error("Signing Error:", error);
		res.status(500).json({
			message: "Error processing signature",
			error: error.message,
		});
	}
};

/**
 * Deletes or cancels a contract.
 * Lister can delete DRAFT contracts or cancel contracts waiting for signatures.
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

		// Security: Only lister can delete
		if (contract.lister.toString() !== req.user.userId) {
			return res.status(403).json({
				message: "Only the lister can delete this contract.",
			});
		}

		// Determine action based on status
		if (contract.status === "COMPLETED") {
			return res.status(400).json({
				message: "Cannot delete completed contracts. Both parties have signed.",
			});
		}

		// For DRAFT, PENDING_TENANT_SIGNATURE, PENDING_LISTER_SIGNATURE, CANCELLED - allow deletion
		await Contract.findByIdAndDelete(req.params.id);

		const action =
			contract.status === "DRAFT" ? "deleted" : "cancelled";
		res.json({ message: `Contract ${action} successfully` });
	} catch (error) {
		console.error("Error deleting contract:", error);
		res.status(500).json({ message: "Server Error" });
	}
};
