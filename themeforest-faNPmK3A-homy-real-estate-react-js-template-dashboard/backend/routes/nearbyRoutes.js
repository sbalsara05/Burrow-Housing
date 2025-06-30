const express = require('express');
const router = express.Router();

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

        console.log(`🔍 Searching for nearby places from: ${latitude}, ${longitude}`);

        // Define place types with Google Places API types
        const placeTypes = [
            {
                categoryTitle: 'University:',
                type: 'university',
                searchRadius: 25000, // 25km for universities
            },
            {
                categoryTitle: 'Grocery Store:',
                type: 'grocery_or_supermarket',
                searchRadius: 8000, // 8km for grocery stores
            },
            {
                categoryTitle: 'Metro Station:',
                type: 'subway_station',
                searchRadius: 8000, // 8km for metro stations
            },
            {
                categoryTitle: 'Gym:',
                type: 'gym',
                searchRadius: 10000, // 10km for gyms
            },
            {
                categoryTitle: 'Hospital:',
                type: 'hospital',
                searchRadius: 25000, // 25km for hospitals
            },
            {
                categoryTitle: 'Shopping Mall:',
                type: 'shopping_mall',
                searchRadius: 20000, // 20km for shopping malls
            },
            {
                categoryTitle: 'Police Station:',
                type: 'police',
                searchRadius: 15000, // 15km for police stations
            },
            {
                categoryTitle: 'Bus Station:',
                type: 'bus_station',
                searchRadius: 5000, // 5km for bus stations
            },
            {
                categoryTitle: 'Market:',
                type: 'supermarket',
                searchRadius: 10000, // 10km for markets
            }
        ];

        const nearbyPlaces = [];

        // Search for each place type using Google Places API
        for (const placeType of placeTypes) {
            try {
                console.log(`\n🔍 Searching for ${placeType.categoryTitle} using Google Places API...`);

                // Build Google Places API URL (Nearby Search)
                const googlePlacesUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
                googlePlacesUrl.searchParams.append('location', `${latitude},${longitude}`);
                googlePlacesUrl.searchParams.append('radius', placeType.searchRadius.toString());
                googlePlacesUrl.searchParams.append('type', placeType.type);
                googlePlacesUrl.searchParams.append('key', process.env.GOOGLE_PLACES_API_KEY);

                console.log(`🔗 Google Places URL: ${googlePlacesUrl.toString()}`);

                const response = await fetch(googlePlacesUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log(`📊 Raw results returned: ${data.results?.length || 0}`);

                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    // Calculate distance for all results
                    let resultsWithDistance = data.results.map(place => {
                        const distance = calculateDistanceInMiles(
                            latitude,
                            longitude,
                            place.geometry.location.lat,
                            place.geometry.location.lng
                        );

                        return {
                            ...place,
                            calculatedDistance: distance,
                            placeName: place.name || 'Unknown Place'
                        };
                    }).filter(place =>
                        place.placeName !== 'Unknown Place' &&
                        place.business_status !== 'CLOSED_PERMANENTLY'
                    );

                    if (resultsWithDistance.length > 0) {
                        // Sort by distance (closest first)
                        resultsWithDistance.sort((a, b) => a.calculatedDistance - b.calculatedDistance);

                        // Take the closest one
                        const closest = resultsWithDistance[0];
                        const placeName = closest.placeName;

                        nearbyPlaces.push({
                            title: `${placeType.categoryTitle} ${placeName}`,
                            count: `${closest.calculatedDistance.toFixed(1)}mi`
                        });

                        console.log(`✅ ${placeType.categoryTitle}`);
                        console.log(`   📍 Closest: ${closest.placeName}`);
                        console.log(`   📏 Distance: ${closest.calculatedDistance.toFixed(2)}mi`);
                        console.log(`   🗺️  Coordinates: (${closest.geometry.location.lat}, ${closest.geometry.location.lng})`);
                        console.log(`   ⭐ Rating: ${closest.rating || 'N/A'}`);

                        // Show top 3 results for debugging
                        if (resultsWithDistance.length > 1) {
                            console.log(`\n   🏆 TOP 3 ${placeType.categoryTitle.toUpperCase()} FOUND:`);
                            resultsWithDistance.slice(0, 3).forEach((result, i) => {
                                console.log(`   ${i + 1}. ${result.placeName} - ${result.calculatedDistance.toFixed(2)}mi (Rating: ${result.rating || 'N/A'})`);
                            });
                        }
                    } else {
                        console.log(`❌ No valid places found for ${placeType.categoryTitle} after filtering`);
                        nearbyPlaces.push({
                            title: placeType.categoryTitle,
                            count: 'N/A'
                        });
                    }
                } else if (data.status === 'ZERO_RESULTS') {
                    console.log(`❌ No results found for ${placeType.categoryTitle}`);
                    nearbyPlaces.push({
                        title: placeType.categoryTitle,
                        count: 'N/A'
                    });
                } else {
                    console.log(`❌ API Error for ${placeType.categoryTitle}: ${data.status} - ${data.error_message || 'Unknown error'}`);
                    nearbyPlaces.push({
                        title: placeType.categoryTitle,
                        count: 'N/A'
                    });
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`❌ Error fetching ${placeType.categoryTitle}:`, error.message);
                nearbyPlaces.push({
                    title: placeType.categoryTitle,
                    count: 'N/A'
                });
            }
        }

        res.json({
            success: true,
            places: nearbyPlaces,
            dataSource: 'Google Places API',
            debug: {
                propertyCoords: `${latitude}, ${longitude}`,
                totalResults: nearbyPlaces.length
            }
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

// Distance calculation function (Haversine formula)
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
    const lat1Rad = parseFloat(lat1) * Math.PI / 180;
    const lon1Rad = parseFloat(lon1) * Math.PI / 180;
    const lat2Rad = parseFloat(lat2) * Math.PI / 180;
    const lon2Rad = parseFloat(lon2) * Math.PI / 180;

    const R = 3959; // Radius of the Earth in miles
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
}

router.get('/nearby', getNearbyPlaces);

module.exports = router;