/**
 * Quick script to find your user ID and available property IDs
 */

const mongoose = require("mongoose");
const User = require("./models/userModel");
const Property = require("./models/propertyModel");
require("dotenv").config();
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

async function findIds() {
	try {
		const uri = process.env.MONGODB_URI;
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		// Find your user (assuming you know your email - change this)
		const userEmail = process.argv[2] || "your-email@example.com";
		const user = await User.findOne({ email: userEmail });

		if (user) {
			console.log("\n👤 Your User Info:");
			console.log(`   ID: ${user._id}`);
			console.log(`   Name: ${user.name}`);
			console.log(`   Email: ${user.email}`);
			console.log(`   Is Ambassador: ${user.isAmbassador}`);
			console.log(`   Ambassador Status: ${user.ambassadorStatus}`);
		} else {
			console.log(`\n❌ User with email "${userEmail}" not found.`);
			console.log("   Usage: node findUserAndProperty.js your-email@example.com");
		}

		// Find some properties
		const properties = await Property.find().limit(5).select("_id overview.title userId");
		console.log("\n🏠 Available Properties:");
		properties.forEach((prop, index) => {
			console.log(`   ${index + 1}. ${prop.overview?.title || 'Untitled'}`);
			console.log(`      ID: ${prop._id}`);
			console.log(`      Owner ID: ${prop.userId}`);
		});

		await mongoose.disconnect();
	} catch (error) {
		console.error("Error:", error);
	}
}

findIds();
