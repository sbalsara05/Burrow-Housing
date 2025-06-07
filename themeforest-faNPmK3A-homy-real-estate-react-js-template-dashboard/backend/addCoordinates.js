// addCoordinates.js - Run this script in your backend directory
// Usage: node addCoordinates.js

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Use the same connection string as your server.js
const MONGODB_URI = process.env.MONGODB_URI;

// Boston neighborhood coordinates
const neighborhoodCoordinates = {
    'Allston': { lat: 42.3352, lng: -71.1053 },
    'Back Bay': { lat: 42.3505, lng: -71.0763 },
    'Beacon Hill': { lat: 42.3588, lng: -71.0707 },
    'Brighton': { lat: 42.3435, lng: -71.1596 },
    'Charlestown': { lat: 42.3782, lng: -71.0602 },
    'Chinatown': { lat: 42.3505, lng: -71.0621 },
    'Dorchester': { lat: 42.3118, lng: -71.0653 },
    'Fenway': { lat: 42.3467, lng: -71.0972 },
    'Hyde Park': { lat: 42.2553, lng: -71.1253 },
    'Jamaica Plain': { lat: 42.3118, lng: -71.1147 },
    'Mattapan': { lat: 42.2676, lng: -71.0919 },
    'Mission Hill': { lat: 42.3299, lng: -71.1010 },
    'North End': { lat: 42.3647, lng: -71.0544 },
    'Roslindale': { lat: 42.2843, lng: -71.1287 },
    'Roxbury': { lat: 42.3118, lng: -71.0851 },
    'South Boston': { lat: 42.3331, lng: -71.0420 },
    'South End': { lat: 42.3396, lng: -71.0723 },
    'West End': { lat: 42.3647, lng: -71.0661 },
    'West Roxbury': { lat: 42.2843, lng: -71.1593 },
    'Wharf District': { lat: 42.3601, lng: -71.0515 }
};

// Property schema - adjust this to match your actual Property model
const propertySchema = new mongoose.Schema({}, { strict: false }); // Using flexible schema
const Property = mongoose.model('Property', propertySchema);

const addCoordinatesToProperties = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find all properties that don't have valid coordinates
        const properties = await Property.find({
            $or: [
                { 'addressAndLocation.location': { $exists: false } },
                { 'addressAndLocation.location.lat': { $exists: false } },
                { 'addressAndLocation.location.lng': { $exists: false } },
                { 'addressAndLocation.location.lat': 0 },
                { 'addressAndLocation.location.lng': 0 },
                { 'addressAndLocation.location.lat': null },
                { 'addressAndLocation.location.lng': null }
            ]
        });

        console.log(`📍 Found ${properties.length} properties that need coordinates`);

        if (properties.length === 0) {
            console.log('🎉 All properties already have coordinates!');
            process.exit(0);
        }

        let updated = 0;
        let failed = 0;

        for (const property of properties) {
            try {
                const neighborhood = property.overview?.neighborhood || 'Back Bay';
                const baseCoords = neighborhoodCoordinates[neighborhood] || neighborhoodCoordinates['Back Bay'];

                // Add small random offset so properties aren't all in same spot (±0.01 degrees ≈ ±1km)
                const lat = baseCoords.lat + (Math.random() - 0.5) * 0.02;
                const lng = baseCoords.lng + (Math.random() - 0.5) * 0.02;

                console.log(`📌 Updating property: ${property._id} in ${neighborhood} → (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

                // Update the property with coordinates
                await Property.findByIdAndUpdate(
                    property._id,
                    {
                        $set: {
                            'addressAndLocation.location': {
                                lat: lat,
                                lng: lng
                            }
                        }
                    },
                    { new: true }
                );

                updated++;
                console.log(`✅ Updated property ${updated}/${properties.length}`);

            } catch (error) {
                console.error(`❌ Failed to update property ${property._id}:`, error.message);
                failed++;
            }
        }

        console.log('\n🎉 RESULTS:');
        console.log(`✅ Successfully updated: ${updated} properties`);
        console.log(`❌ Failed to update: ${failed} properties`);
        console.log(`📊 Total processed: ${properties.length} properties`);

        if (updated > 0) {
            console.log('\n🚀 Your map should now show markers for all properties!');
            console.log('💡 Refresh your frontend to see the changes.');
        }

    } catch (error) {
        console.error('💥 Script failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Helper function to verify coordinates were added
const verifyCoordinates = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const propertiesWithCoords = await Property.find({
            'addressAndLocation.location.lat': { $exists: true, $ne: 0, $ne: null },
            'addressAndLocation.location.lng': { $exists: true, $ne: 0, $ne: null }
        });

        const totalProperties = await Property.countDocuments();

        console.log(`\n📊 VERIFICATION RESULTS:`);
        console.log(`📍 Properties with coordinates: ${propertiesWithCoords.length}`);
        console.log(`📄 Total properties: ${totalProperties}`);
        console.log(`✅ Coverage: ${((propertiesWithCoords.length / totalProperties) * 100).toFixed(1)}%`);

        if (propertiesWithCoords.length > 0) {
            console.log('\n📋 Sample coordinates:');
            propertiesWithCoords.slice(0, 3).forEach((prop, i) => {
                const coords = prop.addressAndLocation?.location;
                console.log(`${i + 1}. ${prop.overview?.neighborhood}: (${coords?.lat?.toFixed(4)}, ${coords?.lng?.toFixed(4)})`);
            });
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};

// Main execution
const main = async () => {
    console.log('🗺️  PROPERTY COORDINATES UPDATER');
    console.log('=================================\n');

    // Check command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--verify') || args.includes('-v')) {
        await verifyCoordinates();
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage:');
        console.log('  node addCoordinates.js           # Add coordinates to properties');
        console.log('  node addCoordinates.js --verify  # Check current coordinate coverage');
        console.log('  node addCoordinates.js --help    # Show this help');
    } else {
        await addCoordinatesToProperties();
    }
};

// Run the script
main();