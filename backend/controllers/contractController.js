const Contract = require("../models/contractModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");

// Initiate a Draft (Triggered from Chat/Request)
exports.createDraft = async (req, res) => {
	try {
		const { propertyId, tenantId } = req.body;
		const listerId = req.user.userId; 

		// Verification: Ensure property exists and belongs to this lister
		const property = await Property.findOne({
			_id: propertyId,
			userId: listerId,
		});

		if (!property) {
			return res
				.status(404)
				.json({
					message: "Property not found or you are not the owner.",
				});
		}

		// Check if an active contract already exists to prevent duplicates
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

		// Default Template Content
		const defaultTemplate = `
      <h3>Sublease Agreement</h3>
      <p>The tenant agrees to pay a monthly rent of <strong>{{Rent_Amount}}</strong>.</p>
      <p>Lease Start Date: <strong>{{Start_Date}}</strong></p>
      <p>Lease End Date: <strong>{{End_Date}}</strong></p>
      <p>Security Deposit: <strong>{{Security_Deposit}}</strong></p>
    `;

		// Pre-fill variables from Property data where possible
		const defaultVariables = {
			Rent_Amount: property.overview?.rent
				? `$${property.overview.rent}`
				: "",
			Start_Date: "",
			End_Date: "",
			Security_Deposit: "",
		};

		const newContract = await Contract.create({
			property: propertyId,
			lister: listerId,
			tenant: tenantId,
			templateHtml: defaultTemplate,
			variables: defaultVariables,
		});

		res.status(201).json(newContract);
	} catch (error) {
		console.error("Error creating draft:", error);
		res.status(500).json({
			message: "Server Error",
			error: error.message,
		});
	}
};

// Get User's Agreements (For the Dashboard)
exports.getMyAgreements = async (req, res) => {
	try {
		const userId = req.user.userId;

		const contracts = await Contract.find({
			$or: [{ lister: userId }, { tenant: userId }],
		})
			.populate(
				"property",
				"overview.title addressAndLocation.address images"
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

// Get Single Contract Details
exports.getContractById = async (req, res) => {
	try {
		const contract = await Contract.findById(req.params.id)
			.populate("property")
			.populate("lister", "name")
			.populate("tenant", "name");

		if (!contract) {
			return res
				.status(404)
				.json({ message: "Contract not found" });
		}

		// Security Check: Only participants can view
		const userId = req.user.userId;
		if (
			contract.lister._id.toString() !== userId &&
			contract.tenant._id.toString() !== userId
		) {
			return res
				.status(403)
				.json({
					message: "Not authorized to view this contract",
				});
		}

		res.json(contract);
	} catch (error) {
		console.error("Error fetching contract:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

// Update Draft (Lister Only)
exports.updateDraft = async (req, res) => {
	try {
		const { templateHtml, variables } = req.body;
		const contract = await Contract.findById(req.params.id);

		if (!contract)
			return res
				.status(404)
				.json({ message: "Contract not found" });

		// Only Lister can edit, and only in DRAFT mode
		if (contract.lister.toString() !== req.user.userId) {
			return res
				.status(403)
				.json({
					message: "Only the lister can edit the contract.",
				});
		}
		if (contract.status !== "DRAFT") {
			return res
				.status(400)
				.json({
					message: "Cannot edit a contract that is already locked or signed.",
				});
		}

		contract.templateHtml = templateHtml;
		contract.variables = variables;
		await contract.save();

		res.json(contract);
	} catch (error) {
		console.error("Error updating draft:", error);
		res.status(500).json({ message: "Server Error" });
	}
};
