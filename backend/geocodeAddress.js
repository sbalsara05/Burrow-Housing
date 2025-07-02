// geocodeAddress.js - Utility to get accurate coordinates for an address
require('dotenv').config();

const geocodeAddress = async (address) => {
    try {
        console.log(`🗺️  Geocoding address: "${address}"`);

        // Use Google Geocoding API if available
        const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

        if (GOOGLE_API_KEY) {
            console.log('🔑 Using Google Geocoding API...');
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_API_KEY}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    console.log(`✅ Google result: (${location.lat}, ${location.lng})`);
                    return {
                        latitude: location.lat,
                        longitude: location.lng,
                        source: 'Google Geocoding API',
                        formatted_address: data.results[0].formatted_address
                    };
                }
            }
        }

        // Fallback to free Nominatim API (OpenStreetMap)
        console.log('🆓 Using Nominatim (free) geocoding...');
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
            {
                headers: {
                    'User-Agent': 'PropertyApp/1.0'
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const result = data[0];
                console.log(`✅ Nominatim result: (${result.lat}, ${result.lon})`);
                return {
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    source: 'Nominatim (OpenStreetMap)',
                    formatted_address: result.display_name
                };
            }
        }

        throw new Error('No geocoding results found');

    } catch (error) {
        console.error('❌ Geocoding failed:', error.message);
        return null;
    }
};

// Test specific address
const testAddress = async () => {
    const testAddr = "78 Commonwealth Ave, Brighton, MA";
    console.log(`\n🧪 Testing geocoding for: "${testAddr}"`);

    const result = await geocodeAddress(testAddr);
    if (result) {
        console.log(`📍 Coordinates: ${result.latitude}, ${result.longitude}`);
        console.log(`🏷️  Source: ${result.source}`);
        console.log(`📧 Formatted: ${result.formatted_address}`);

        // Calculate distance to Prudential Center
        const prudentialLat = 42.3467;
        const prudentialLng = -71.0972;

        const distance = calculateDistance(result.latitude, result.longitude, prudentialLat, prudentialLng);
        console.log(`📏 Distance to Prudential Center: ${distance.toFixed(2)} miles`);

        // Also test distance to some Brighton landmarks
        const brightonCoords = { lat: 42.3435, lng: -71.1596 }; // Brighton center from your addCoordinates.js
        const distanceToBrighton = calculateDistance(result.latitude, result.longitude, brightonCoords.lat, brightonCoords.lng);
        console.log(`📏 Distance to Brighton Center: ${distanceToBrighton.toFixed(2)} miles`);

    } else {
        console.log('❌ Could not geocode the address');
    }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Run the test if this file is executed directly
if (require.main === module) {
    testAddress();
}

module.exports = { geocodeAddress };