/**
 * Script to set a user as an active ambassador
 * Usage: node setAmbassador.js <user-email>
 */

const mongoose = require("mongoose");
const User = require("./models/userModel");
require("dotenv").config();
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, ".env") });

const userEmail = process.argv[2];

if (!userEmail) {
	console.log("Usage: node setAmbassador.js <user-email>");
	console.log("Example: node setAmbassador.js user@example.com");
	process.exit(1);
}

async function setAmbassador() {
	try {
		// Connect to MongoDB
		const uri = process.env.MONGODB_URI;
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("✅ Connected to MongoDB");

		// Find user by email
		const user = await User.findOne({ email: userEmail });

		if (!user) {
			console.log(`❌ User with email "${userEmail}" not found.`);
			process.exit(1);
		}

		console.log(`📧 Found user: ${user.name} (${user.email})`);

		// Update user to be an active ambassador
		user.isAmbassador = true;
		user.ambassadorStatus = "active";
		
		// Set some default ambassador profile data
		if (!user.ambassadorProfile) {
			user.ambassadorProfile = {};
		}
		user.ambassadorProfile.completedInspections = user.ambassadorProfile.completedInspections || 47;
		user.ambassadorProfile.rating = user.ambassadorProfile.rating || 4.8;

		await user.save();

		console.log("✅ User successfully set as active ambassador!");
		console.log("\n📊 Ambassador Profile:");
		console.log(`   - Status: ${user.ambassadorStatus}`);
		console.log(`   - Completed Inspections: ${user.ambassadorProfile.completedInspections}`);
		console.log(`   - Rating: ${user.ambassadorProfile.rating}`);
		console.log("\n💡 Next steps:");
		console.log("   1. Log out and log back in (or refresh the page)");
		console.log("   2. You should see 'Ambassador Dashboard' in the sidebar");
		console.log("   3. Navigate to /dashboard/ambassador");

		await mongoose.disconnect();
		console.log("\n✅ Disconnected from MongoDB");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

setAmbassador();
