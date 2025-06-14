const express = require('express');
const router = express.Router();

// You can use Google Places API, Yelp API, or any other service
// For this example, I'll show Google Places API implementation

const getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Validate coordinates
        let latitude, longitude;

        try {
            latitude = parseFloat(lat);
            longitude = parseFloat(lng);

            // Check if they're valid numbers in a reasonable range
            if (isNaN(latitude) || isNaN(longitude) || 
                latitude < -90 || latitude > 90 || 
                longitude < -180 || longitude > 180) {
                throw new Error('Invalid coordinate range');
            }
        } catch (error) {
            console.error('Coordinate parsing error:', error, { lat, lng });
            return res.status(400).json({
                success: false,
                message: 'The string did not match the expected pattern'
            });
        }

        // Google Places API implementation (you'll need to add your API key)
        const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
        
        if (!GOOGLE_PLACES_API_KEY) {
            console.warn('Google Places API key not found, returning mock data');
            return res.json({
                success: true,
                places: [
                    { title: "School & College:", count: "0.5mi" },
                    { title: "Grocery Center:", count: "0.2mi" },
                    { title: "Metro Station:", count: "0.4mi" },
                    { title: "Gym:", count: "0.7mi" },
                    { title: "University:", count: "1.3mi" },
                    { title: "Hospital:", count: "0.9mi" },
                    { title: "Shopping Mall:", count: "0.6mi" },
                    { title: "Police Station:", count: "0.9mi" },
                    { title: "Bus Station:", count: "0.5mi" },
                    { title: "Market:", count: "1.7mi" },
                ]
            });
        }

        // Define place types to search for
        const placeTypes = [
            { type: 'school', title: 'School & College:' },
            { type: 'grocery_or_supermarket', title: 'Grocery Center:' },
            { type: 'subway_station', title: 'Metro Station:' },
            { type: 'gym', title: 'Gym:' },
            { type: 'university', title: 'University:' },
            { type: 'hospital', title: 'Hospital:' },
            { type: 'shopping_mall', title: 'Shopping Mall:' },
            { type: 'police', title: 'Police Station:' },
            { type: 'bus_station', title: 'Bus Station:' },
            { type: 'supermarket', title: 'Market:' }
        ];

        const nearbyPlaces = [];

        // Search for each place type
        for (const placeType of placeTypes) {
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${placeType.type}&key=${GOOGLE_PLACES_API_KEY}`
                );

                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    // Find the closest place of this type
                    const closest = data.results[0];

                    // Calculate distance in miles
                    const distanceInMiles = calculateDistanceInMiles(latitude, longitude, closest.geometry.location.lat, closest.geometry.location.lng);

                    nearbyPlaces.push({
                        title: placeType.title,
                        count: `${distanceInMiles.toFixed(1)}mi`
                    });
                } else {
                    // Add with unknown distance if not found
                    nearbyPlaces.push({
                        title: placeType.title,
                        count: 'N/A'
                    });
                }
            } catch (error) {
                console.error(`Error fetching ${placeType.type}:`, error);
                nearbyPlaces.push({
                    title: placeType.title,
                    count: 'N/A'
                });
            }
        }

        res.json({
            success: true,
            places: nearbyPlaces
        });

    } catch (error) {
        console.error('Error in getNearbyPlaces:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function to calculate distance between two coordinates in miles
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
    const R = 3959; // Radius of the Earth in miles (instead of 6371 km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in miles
    return d;
}

router.get('/nearby', getNearbyPlaces);

module.exports = router;