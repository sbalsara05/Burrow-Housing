
// backend/utils/geocodingService.js
const { geocodeAddress } = require('../backend/geocodeAddress');

// Neighborhood fallback coordinates
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

/**
 * Geocode an address and return coordinates with source info
 */
const geocodePropertyAddress = async (address, neighborhood = 'Back Bay') => {
    console.log(`🔍 Geocoding new property address: "${address}"`);

    try {
        // Try to geocode the actual address first
        const geocodeResult = await geocodeAddress(address);

        if (geocodeResult) {
            console.log(`✅ Successfully geocoded: (${geocodeResult.latitude}, ${geocodeResult.longitude}) via ${geocodeResult.source}`);

            return {
                location: {
                    lat: geocodeResult.latitude,
                    lng: geocodeResult.longitude
                },
                address: geocodeResult.formatted_address || address,
                coordinateSource: `geocoded-${geocodeResult.source}`,
                lastGeocoded: new Date()
            };
        }
    } catch (error) {
        console.error(`❌ Geocoding failed for "${address}":`, error.message);
    }

    // Fallback to neighborhood center if geocoding fails
    console.log(`⚠️ Using neighborhood fallback for: ${neighborhood}`);
    const baseCoords = neighborhoodCoordinates[neighborhood] || neighborhoodCoordinates['Back Bay'];

    return {
        location: {
            lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, // Small random offset
            lng: baseCoords.lng + (Math.random() - 0.5) * 0.02
        },
        address: address,
        coordinateSource: 'neighborhood-fallback',
        lastGeocoded: new Date()
    };
};

module.exports = { geocodePropertyAddress };