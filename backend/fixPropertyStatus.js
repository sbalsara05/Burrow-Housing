const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Adjust the path if your models are in a different directory
const Property = require('./models/propertyModel'); 

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file. Please add it.');
    process.exit(1);
}

const updatePropertyStatuses = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB.');

        // Find all properties where the 'status' field does not exist
        const query = { status: { $exists: false } };
        const propertiesToUpdate = await Property.find(query);

        if (propertiesToUpdate.length === 0) {
            console.log('🎉 All property documents already have a status field. No action needed.');
            return;
        }

        console.log(`🔍 Found ${propertiesToUpdate.length} property/properties missing the 'status' field. Starting update...`);

        // Update all found documents by setting status to "Active"
        const updateResult = await Property.updateMany(
            query,
            { $set: { status: "Active" } }
        );
        
        console.log(`✅ Successfully updated ${updateResult.nModified} property document(s).`);

    } catch (error) {
        console.error('💥 An error occurred during the data migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB.');
    }
};

updatePropertyStatuses();