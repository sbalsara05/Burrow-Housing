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
        
        // TEST: Calculate distance to known locations for debugging
        console.log('\n🧪 DEBUG: Testing distance calculations...');
        
        // Prudential Center coordinates (known location)
        const prudentialLat = 42.3467;
        const prudentialLng = -71.0972;
        
        // Calculate distance using our function
        const distanceToPrudential = calculateDistanceInMiles(latitude, longitude, prudentialLat, prudentialLng);
        console.log(`📏 Distance to Prudential Center: ${distanceToPrudential.toFixed(2)}mi`);
        console.log(`📍 Your property coords: (${latitude}, ${longitude})`);
        console.log(`📍 Prudential coords: (${prudentialLat}, ${prudentialLng})`);
        
        // Test if this matches Google's calculation
        console.log(`🔗 Google Maps distance check: https://www.google.com/maps/dir/${latitude},${longitude}/${prudentialLat},${prudentialLng}`);

        // Helper function to filter out sub-schools and departments
        const isMainUniversity = (name) => {
            if (!name) return false;
            
            const nameLower = name.toLowerCase();
            
            // Exclude sub-schools, departments, and specific buildings
            const excludeKeywords = [
                'school of', 'college of', 'department of', 'faculty of',
                'institute of', 'center for', 'centre for', 'division of',
                'building', 'hall', 'library', 'laboratory', 'lab',
                'campus', 'dormitory', 'residence', 'dining',
                'medical school', 'law school', 'business school',
                'graduate school', 'dental school', 'nursing school'
            ];
            
            // Return false if name contains any exclude keywords
            for (const keyword of excludeKeywords) {
                if (nameLower.includes(keyword)) {
                    return false;
                }
            }
            
            // Only include if it contains main university keywords
            const includeKeywords = [
                'university', 'college', 'institute of technology',
                'polytechnic', 'academy'
            ];
            
            return includeKeywords.some(keyword => nameLower.includes(keyword));
        };

        // Define place types with OpenStreetMap tags and search radius
        const placeTypes = [
            {
                categoryTitle: 'University:',
                osmTags: ['amenity=university', 'amenity=college'],
                searchRadius: 25000, // 25km for universities
                customFilter: isMainUniversity // Add custom filter for universities
            },
            {
                categoryTitle: 'Grocery Store:',
                osmTags: ['shop=supermarket', 'shop=grocery', 'shop=convenience'],
                searchRadius: 8000, // 8km for grocery stores
            },
            {
                categoryTitle: 'Metro Station:',
                osmTags: ['public_transport=station', 'railway=subway_entrance', 'railway=station'],
                searchRadius: 8000, // 8km for metro stations
            },
            {
                categoryTitle: 'Gym:',
                osmTags: ['leisure=fitness_centre', 'leisure=sports_centre'],
                searchRadius: 10000, // 10km for gyms
            },
            {
                categoryTitle: 'Hospital:',
                osmTags: ['amenity=hospital', 'healthcare=hospital'],
                searchRadius: 25000, // 25km for hospitals
            },
            {
                categoryTitle: 'Shopping Mall:',
                osmTags: ['shop=mall', 'amenity=marketplace'],
                searchRadius: 20000, // 20km for shopping malls
            },
            {
                categoryTitle: 'Police Station:',
                osmTags: ['amenity=police'],
                searchRadius: 15000, // 15km for police stations
            },
            {
                categoryTitle: 'Bus Station:',
                osmTags: ['amenity=bus_station', 'public_transport=platform', 'highway=bus_stop'],
                searchRadius: 5000, // 5km for bus stations
            },
            {
                categoryTitle: 'Market:',
                osmTags: ['amenity=marketplace', 'shop=wholesale'],
                searchRadius: 10000, // 10km for markets
            }
        ];

        const nearbyPlaces = [];

        // Search for each place type using Overpass API
        for (const placeType of placeTypes) {
            try {
                console.log(`\n🔍 Searching for ${placeType.categoryTitle} using OpenStreetMap...`);
                
                // Build Overpass query for this place type
                const tagQueries = placeType.osmTags.map(tag => 
                    `node["${tag.split('=')[0]}"="${tag.split('=')[1]}"](around:${placeType.searchRadius},${latitude},${longitude});`
                ).join('\n  ');

                const overpassQuery = `[out:json][timeout:25];
(
  ${tagQueries}
);
out center;`;

                const response = await fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: overpassQuery
                });

                if (!response.ok) {
                    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log(`📊 Raw results returned: ${data.elements?.length || 0}`);

                if (data.elements && data.elements.length > 0) {
                    // Calculate distance for all results
                    let resultsWithDistance = data.elements.map(place => {
                        const distance = calculateDistanceInMiles(
                            latitude,
                            longitude,
                            place.lat,
                            place.lon
                        );
                        
                        return {
                            ...place,
                            calculatedDistance: distance,
                            name: place.tags?.name || place.tags?.operator || 'Unknown Place'
                        };
                    }).filter(place => place.name !== 'Unknown Place'); // Filter out places without names

                    // Apply custom filter if it exists (for universities)
                    if (placeType.customFilter) {
                        const beforeFilter = resultsWithDistance.length;
                        resultsWithDistance = resultsWithDistance.filter(place => 
                            placeType.customFilter(place.name)
                        );
                        console.log(`🎓 Filtered ${beforeFilter} results down to ${resultsWithDistance.length} main universities`);
                    }

                    if (resultsWithDistance.length > 0) {
                        // Sort by distance (closest first)
                        resultsWithDistance.sort((a, b) => a.calculatedDistance - b.calculatedDistance);

                        // Take the closest one
                        const closest = resultsWithDistance[0];
                        const placeName = closest.name;
                        const fullTitle = `${placeType.categoryTitle} ${placeName}`;

                        nearbyPlaces.push({
                            title: fullTitle,
                            count: `${closest.calculatedDistance.toFixed(1)}mi`
                        });

                        console.log(`✅ ${placeType.categoryTitle}`);
                        console.log(`   📍 Closest: ${closest.name}`);
                        console.log(`   📏 Distance: ${closest.calculatedDistance.toFixed(2)}mi`);
                        console.log(`   🗺️  Coordinates: (${closest.lat}, ${closest.lon})`);
                        
                        // Enhanced debugging for first few results
                        if (placeType.categoryTitle === 'University:' && resultsWithDistance.length > 1) {
                            console.log(`\n   🎓 TOP 3 MAIN UNIVERSITIES FOUND:`);
                            resultsWithDistance.slice(0, 3).forEach((result, i) => {
                                console.log(`   ${i + 1}. ${result.name} - ${result.calculatedDistance.toFixed(2)}mi at (${result.lat}, ${result.lon})`);
                            });
                        }
                    } else {
                        console.log(`❌ No valid places found for ${placeType.categoryTitle} after filtering`);
                        nearbyPlaces.push({
                            title: placeType.categoryTitle,
                            count: 'N/A'
                        });
                    }
                } else {
                    console.log(`❌ No results found for ${placeType.categoryTitle}`);
                    nearbyPlaces.push({
                        title: placeType.categoryTitle,
                        count: 'N/A'
                    });
                }

                // Add small delay to avoid overwhelming Overpass API
                await new Promise(resolve => setTimeout(resolve, 100));

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
            dataSource: 'OpenStreetMap via Overpass API',
            debug: {
                propertyCoords: `${latitude}, ${longitude}`,
                distanceToPrudential: `${distanceToPrudential.toFixed(2)}mi`,
                googleMapsCheck: `https://www.google.com/maps/dir/${latitude},${longitude}/${prudentialLat},${prudentialLng}`
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

// Enhanced distance calculation with better precision
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
    // Ensure all values are properly converted to numbers
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
    
    // Debug logging for first calculation
    if (typeof calculateDistanceInMiles.firstCall === 'undefined') {
        calculateDistanceInMiles.firstCall = true;
        console.log(`🧮 Distance calculation debug:`);
        console.log(`   Point 1: (${lat1}, ${lon1})`);
        console.log(`   Point 2: (${lat2}, ${lon2})`);
        console.log(`   Calculated distance: ${distance.toFixed(4)} miles`);
    }
    
    return distance;
}

router.get('/nearby', getNearbyPlaces);

module.exports = router;