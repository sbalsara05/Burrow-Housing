// frontend/components/ListingDetails/listing-details-common/CommonNearbyList.tsx
import React, { useState, useEffect } from 'react';

// Add this at the top of your file
const API_BASE_URL = 'http://localhost:3000';

// Define props interface (accepting location object)
interface LocationData {
    address: string;
    latitude?: number;
    longitude?: number;
}

interface CommonNearbyListProps {
    location?: LocationData | null;
}

// Static data as fallback
const static_list_data = [
    { title: "School & College:", count: "0.9km" },
    { title: "Grocery Center:", count: "0.2km" },
    { title: "Metro Station:", count: "0.7km" },
    { title: "Gym:", count: "2.3km" },
    { title: "University:", count: "2.7km" },
    { title: "Hospital:", count: "1.7km" },
    { title: "Shopping Mall:", count: "1.1km" },
    { title: "Police Station:", count: "1.2km" },
    { title: "Bus Station:", count: "1.1km" },
    { title: "River:", count: "3.1km" },
    { title: "Market:", count: "3.4km" },
];

const CommonNearbyList: React.FC<CommonNearbyListProps> = ({ location }) => {
    // State for dynamically fetched nearby places
    const [nearbyPlaces, setNearbyPlaces] = useState(static_list_data);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to fetch nearby places using location prop
    useEffect(() => {
        // Add debugging to see what we're actually receiving
        console.log("🔍 Debug - Raw location prop:", location);
        console.log("🔍 Debug - latitude:", location?.latitude, "type:", typeof location?.latitude);
        console.log("🔍 Debug - longitude:", location?.longitude, "type:", typeof location?.longitude);

        if (location?.latitude !== undefined && location?.longitude !== undefined) {
            const fetchNearby = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // Ensure we have valid numeric coordinates
                    const lat = parseFloat(String(location.latitude));
                    const lng = parseFloat(String(location.longitude));

                    console.log("🔍 Debug - Parsed lat:", lat, "lng:", lng);

                    if (isNaN(lat) || isNaN(lng)) {
                        throw new Error('Invalid coordinates');
                    }

                    console.log(`Fetching nearby places for coordinates: ${lat}, ${lng}`);
                    const url = `${API_BASE_URL}/api/nearby?lat=${lat}&lng=${lng}`;
                    console.log("🔍 Debug - Fetch URL:", url);

                    const response = await fetch(url);
                    console.log("🔍 Debug - Response status:", response.status);
                    console.log("🔍 Debug - Response ok:", response.ok);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.log("🔍 Debug - Response error text:", errorText);
                        throw new Error(`Failed to fetch nearby places: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log("🔍 Debug - Response data:", data);

                    if (data.success && data.places && data.places.length > 0) {
                        setNearbyPlaces(data.places);
                        console.log('Successfully fetched nearby places:', data.places);
                    } else {
                        console.warn("No nearby places found, using static data");
                        setNearbyPlaces(static_list_data);
                    }
                } catch (error) {
                    console.error("🔍 Debug - Full error object:", error);
                    console.error("🔍 Debug - Error name:", error?.name);
                    console.error("🔍 Debug - Error message:", error?.message);
                    console.error("🔍 Debug - Error stack:", error?.stack);

                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                    if (errorMessage.includes('did not match the expected pattern')) {
                        setError('Coordinate format is invalid');
                    } else {
                        setError(errorMessage);
                    }

                    setNearbyPlaces(static_list_data); // Fallback to static on error
                } finally {
                    setIsLoading(false);
                }
            };

            fetchNearby();
        } else {
            // Use static data if no coordinates provided
            console.log("No coordinates available, using static nearby data");
            setNearbyPlaces(static_list_data);
        }
    }, [location?.latitude, location?.longitude]); // Refetch if coordinates change

    return (
        <>
            <h4 className="mb-20">What's Nearby</h4>
            <p className="fs-20 lh-lg pb-30">
                {location?.latitude && location?.longitude
                    ? `Real-time distances to points of interest near ${location?.address || 'this location'}.`
                    : `Approximate distances to points of interest near ${location?.address || 'the property'}.`
                }
            </p>

            {isLoading && (
                <div className="d-flex align-items-center mb-3">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <span>Loading nearby places...</span>
                </div>
            )}

            {error && (
                <div className="alert alert-warning mb-3">
                    <small>Could not load real-time data: {error}. Showing approximate distances.</small>
                </div>
            )}

            {nearbyPlaces.length > 0 ? (
                <ul className="style-none d-flex flex-wrap justify-content-between nearby-list-item">
                    {nearbyPlaces.map((list, i) => (
                        <li key={i}>
                            {list.title}
                            <span className="fw-500 color-dark">{list.count}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                !isLoading && <p>Could not load nearby places information.</p>
            )}
        </>
    );
};

export default CommonNearbyList;