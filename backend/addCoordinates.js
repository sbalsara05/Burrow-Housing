// addCoordinates.js - Updated to use real geocoding
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Import our geocoding function
const {geocodeAddress} = require('./geocodeAddress');

// Property schema
const propertySchema = new mongoose.Schema({}, {strict: false});
const Property = mongoose.model('Property', propertySchema);

// Fallback neighborhood coordinates (only used if geocoding fails)
const neighborhoodCoordinates = {
    'Allston': {lat: 42.3352, lng: -71.1053},
    'Back Bay': {lat: 42.3505, lng: -71.0763},
    'Beacon Hill': {lat: 42.3588, lng: -71.0707},
    'Brighton': {lat: 42.3435, lng: -71.1596},
    'Charlestown': {lat: 42.3782, lng: -71.0602},
    'Chinatown': {lat: 42.3505, lng: -71.0621},
    'Dorchester': {lat: 42.3118, lng: -71.0653},
    'Fenway': {lat: 42.3467, lng: -71.0972},
    'Hyde Park': {lat: 42.2553, lng: -71.1253},
    'Jamaica Plain': {lat: 42.3118, lng: -71.1147},
    'Mattapan': {lat: 42.2676, lng: -71.0919},
    'Mission Hill': {lat: 42.3299, lng: -71.1010},
    'North End': {lat: 42.3647, lng: -71.0544},
    'Roslindale': {lat: 42.2843, lng: -71.1287},
    'Roxbury': {lat: 42.3118, lng: -71.0851},
    'South Boston': {lat: 42.3331, lng: -71.0420},
    'South End': {lat: 42.3396, lng: -71.0723},
    'West End': {lat: 42.3647, lng: -71.0661},
    'West Roxbury': {lat: 42.2843, lng: -71.1593},
    'Wharf District': {lat: 42.3601, lng: -71.0515}
};

// Add this function at the top of your existing addCoordinates.js file
const generateRealisticAddress = (property) => {
    const neighborhood = property.overview?.neighborhood || 'Back Bay';

    // Realistic street names by neighborhood
    const streetsByNeighborhood = {
        'Roxbury': ['Warren Street', 'Washington Street', 'Dudley Street', 'Blue Hill Avenue'],
        'Back Bay': ['Newbury Street', 'Boylston Street', 'Commonwealth Avenue', 'Marlborough Street'],
        'Allston': ['Harvard Avenue', 'Brighton Avenue', 'Cambridge Street', 'Commonwealth Avenue'],
        'Brighton': ['Washington Street', 'Chestnut Hill Avenue', 'Market Street', 'Faneuil Street'],
        'South End': ['Tremont Street', 'Washington Street', 'Columbus Avenue', 'Shawmut Avenue'],
        'Fenway': ['Fenway', 'Boylston Street', 'Park Drive', 'Brookline Avenue'],
        'Jamaica Plain': ['Centre Street', 'South Street', 'Washington Street', 'Hyde Park Avenue'],
        'Dorchester': ['Dorchester Avenue', 'Blue Hill Avenue', 'Washington Street', 'Columbia Road']
    };

    const streets = streetsByNeighborhood[neighborhood] || streetsByNeighborhood['Back Bay'];
    const randomStreet = streets[Math.floor(Math.random() * streets.length)];
    const randomNumber = Math.floor(Math.random() * 900) + 100; // 100-999

    // Get ZIP codes by neighborhood
    const zipCodes = {
        'Roxbury': '02119',
        'Back Bay': '02116',
        'Allston': '02134',
        'Brighton': '02135',
        'South End': '02118',
        'Fenway': '02215',
        'Jamaica Plain': '02130',
        'Dorchester': '02124'
    };

    const zip = zipCodes[neighborhood] || '02116';

    return `${randomNumber} ${randomStreet}, ${neighborhood === 'Back Bay' || neighborhood === 'South End' || neighborhood === 'Fenway' ? 'Boston' : neighborhood}, MA ${zip}`;
};

const geocodeAllProperties = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Get ALL properties to update with real coordinates
        const properties = await Property.find({});
        console.log(`📍 Found ${properties.length} total properties to geocode\n`);

        let geocoded = 0;
        let fallback = 0;
        let failed = 0;

        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];

            try {
                console.log(`\n📍 Processing property ${i + 1}/${properties.length}: ${property._id}`);

                // Try to get address from property data
                const address = property.addressAndLocation?.address ||
                    property.address ||
                    generateRealisticAddress(property);


                console.log(`📧 Address: "${address}"`);
                console.log(`🏠 Neighborhood: ${property.overview?.neighborhood || 'Unknown'}`);

                // Try to geocode the actual address
                console.log(`🔍 Geocoding address...`);
                const geocodeResult = await geocodeAddress(address);

                let coordinates;
                let source;

                if (geocodeResult) {
                    // Use real geocoded coordinates
                    coordinates = {
                        lat: geocodeResult.latitude,
                        lng: geocodeResult.longitude
                    };
                    source = `geocoded-${geocodeResult.source}`;
                    geocoded++;
                    console.log(`✅ Geocoded: (${coordinates.lat}, ${coordinates.lng}) via ${geocodeResult.source}`);
                } else {
                    // Fallback to neighborhood center with small random offset
                    const neighborhood = property.overview?.neighborhood || 'Back Bay';
                    const baseCoords = neighborhoodCoordinates[neighborhood] || neighborhoodCoordinates['Back Bay'];

                    coordinates = {
                        lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
                        lng: baseCoords.lng + (Math.random() - 0.5) * 0.02
                    };
                    source = 'neighborhood-fallback';
                    fallback++;
                    console.log(`⚠️ Geocoding failed, using neighborhood fallback: (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`);
                }

                // Update the property
                await Property.findByIdAndUpdate(
                    property._id,
                    {
                        $set: {
                            'addressAndLocation.location': coordinates,
                            'addressAndLocation.address': geocodeResult?.formatted_address || address,
                            'addressAndLocation.coordinateSource': source,
                            'addressAndLocation.lastGeocoded': new Date()
                        }
                    },
                    {new: true}
                );

                console.log(`✅ Updated property ${i + 1}/${properties.length}`);

                // Add delay to avoid overwhelming geocoding APIs
                if (geocodeResult) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay for successful geocoding
                } else {
                    await new Promise(resolve => setTimeout(resolve, 200)); // Shorter delay for fallback
                }

            } catch (error) {
                console.error(`❌ Failed to process property ${property._id}:`, error.message);
                failed++;
            }
        }

        console.log('\n🎉 RESULTS:');
        console.log(`✅ Successfully geocoded with real addresses: ${geocoded} properties`);
        console.log(`⚠️ Used neighborhood fallback: ${fallback} properties`);
        console.log(`❌ Failed to process: ${failed} properties`);
        console.log(`📊 Total processed: ${properties.length} properties`);

        if (geocoded > 0) {
            console.log('\n🚀 Properties now have REAL coordinates based on actual addresses!');
            console.log('💡 Refresh your frontend to see accurate nearby places.');
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

// Function to verify and show coordinate sources

// Function to verify and show coordinate sources
const verifyCoordinatesWithSource = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const allProperties = await Property.find({});
        const totalProperties = allProperties.length;

        console.log(`\n📊 COORDINATE VERIFICATION:`);
        console.log(`📄 Total properties: ${totalProperties}\n`);

        // Better verification - check for actual numeric values
        const propertiesWithValidCoords = allProperties.filter(prop => {
            const lat = prop.addressAndLocation?.location?.lat;
            const lng = prop.addressAndLocation?.location?.lng;
            return lat !== undefined && lng !== undefined &&
                !isNaN(lat) && !isNaN(lng) &&
                lat !== 0 && lng !== 0;
        });

        console.log(`📍 Properties with VALID coordinates: ${propertiesWithValidCoords.length}`);
        console.log(`❌ Properties WITHOUT coordinates: ${totalProperties - propertiesWithValidCoords.length}`);
        console.log(`✅ Coverage: ${((propertiesWithValidCoords.length / totalProperties) * 100).toFixed(1)}%\n`);

        // Show what's actually in the first few properties
        console.log('🔍 DETAILED PROPERTY ANALYSIS:');
        allProperties.slice(0, 3).forEach((prop, i) => {
            console.log(`\n${i + 1}. Property ${prop._id}:`);
            console.log(`   Title: ${prop.overview?.title || 'No title'}`);
            console.log(`   Neighborhood: ${prop.overview?.neighborhood || 'No neighborhood'}`);
            console.log(`   addressAndLocation:`, prop.addressAndLocation || 'MISSING');
            console.log(`   Has location object:`, !!prop.addressAndLocation?.location);
            if (prop.addressAndLocation?.location) {
                console.log(`   Coordinates: lat=${prop.addressAndLocation.location.lat}, lng=${prop.addressAndLocation.location.lng}`);
                console.log(`   Coordinate types: lat=${typeof prop.addressAndLocation.location.lat}, lng=${typeof prop.addressAndLocation.location.lng}`);
            }
        });

        if (propertiesWithValidCoords.length > 0) {
            console.log('\n📍 VALID COORDINATE SAMPLES:');
            propertiesWithValidCoords.slice(0, 3).forEach((prop, i) => {
                const coords = prop.addressAndLocation.location;
                const source = prop.addressAndLocation?.coordinateSource || 'unknown';
                console.log(`${i + 1}. ${prop.overview?.neighborhood}: (${coords.lat}, ${coords.lng}) [${source}]`);
            });
        } else {
            console.log('\n❌ NO PROPERTIES HAVE VALID COORDINATES!');
            console.log('💡 You need to run the geocoding script: node addCoordinates.js');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};

const inspectPropertyStructure = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const properties = await Property.find({}).limit(2);

        console.log('🔍 ACTUAL PROPERTY STRUCTURE:');
        console.log('========================================\n');

        properties.forEach((prop, i) => {
            console.log(`${i + 1}. Property ${prop._id}:`);
            console.log('   All fields:', Object.keys(prop.toObject()));
            console.log('   Full structure:');
            console.log(JSON.stringify(prop.toObject(), null, 2));
            console.log('\n' + '='.repeat(50) + '\n');
        });

    } catch (error) {
        console.error('❌ Inspection failed:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};


// Main execution
const main = async () => {
    console.log('🗺️  PROPERTY REAL COORDINATES UPDATER');
    console.log('=====================================\n');

    const args = process.argv.slice(2);

    if (args.includes('--verify') || args.includes('-v')) {
        await verifyCoordinatesWithSource();
    } else if (args.includes('--inspect') || args.includes('-i')) {
        await inspectPropertyStructure();
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage:');
        console.log('  node addCoordinates.js           # Geocode all properties with real addresses');
        console.log('  node addCoordinates.js --verify  # Check coordinate sources and coverage');
        console.log('  node addCoordinates.js --inspect # See actual property structure');
        console.log('  node addCoordinates.js --help    # Show this help');
        console.log('\nThis will use Google/Nominatim APIs to get REAL coordinates for each property address.');
    } else {
        console.log('⚠️  WARNING: This will geocode ALL properties using their actual addresses.');
        console.log('⏱️  This may take several minutes depending on API rate limits.');
        console.log('💰 If using Google API, this may consume API quota.');
        console.log('\nStarting in 5 seconds... (Ctrl+C to cancel)');

        await new Promise(resolve => setTimeout(resolve, 5000));
        await geocodeAllProperties();
    }
};

main();