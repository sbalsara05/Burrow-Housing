/**
 * Script to create a test ambassador request for testing
 * Usage: node createTestAmbassadorRequest.js <your-user-id> <property-id>
 * 
 * This creates an approved request that you can then claim as an ambassador
 */

const mongoose = require("mongoose");
const AmbassadorRequest = require("./models/ambassadorRequestModel");
const Property = require("./models/propertyModel");
const User = require("./models/userModel");
require("dotenv").config();
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, ".env") });

const userId = process.argv[2];
const propertyId = process.argv[3];

if (!userId || !propertyId) {
	console.log("Usage: node createTestAmbassadorRequest.js <your-user-id> <property-id>");
	console.log("Example: node createTestAmbassadorRequest.js 507f1f77bcf86cd799439011 507f191e810c19729de860ea");
	process.exit(1);
}

async function createTestRequest() {
	try {
		// Connect to MongoDB
		const uri = process.env.MONGODB_URI;
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("✅ Connected to MongoDB");

		// Verify user exists
		const user = await User.findById(userId);
		if (!user) {
			console.log(`❌ User with ID "${userId}" not found.`);
			process.exit(1);
		}

		// Verify property exists
		const property = await Property.findById(propertyId);
		if (!property) {
			console.log(`❌ Property with ID "${propertyId}" not found.`);
			process.exit(1);
		}

		// Check if property belongs to user (we'll use a different requester)
		// For testing, we'll create a request where:
		// - requesterId: the user (as if they're requesting for someone else's property)
		// - listerId: property owner
		// - status: approved (so it shows up in pending requests)

		// Create a test request
		const testRequest = new AmbassadorRequest({
			propertyId: propertyId,
			listerId: property.userId, // Property owner
			requesterId: userId, // You as the requester
			inspectionPoints: [
				{ text: "Check overall condition", details: "General inspection" },
				{ text: "Verify amenities", details: "Check listed amenities" }
			],
			preferredDates: "Anytime this week",
			contactInfo: user.email,
			status: "approved", // Already approved so it shows in pending requests
			propertyTitle: property.overview?.title || "Test Property",
		});

		await testRequest.save();

		console.log("✅ Test ambassador request created successfully!");
		console.log("\n📋 Request Details:");
		console.log(`   - Request ID: ${testRequest._id}`);
		console.log(`   - Property: ${property.overview?.title || propertyId}`);
		console.log(`   - Status: ${testRequest.status}`);
		console.log(`   - Lister: ${property.userId}`);
		console.log(`   - Requester: ${userId} (you)`);
		console.log("\n💡 Next steps:");
		console.log("   1. Refresh your ambassador dashboard");
		console.log("   2. You should see this request in 'Pending Requests Available'");
		console.log("   3. Click 'Claim' to assign it to yourself");
		console.log("   4. It will then appear in 'Today's Schedule'");

		await mongoose.disconnect();
		console.log("\n✅ Disconnected from MongoDB");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

createTestRequest();
