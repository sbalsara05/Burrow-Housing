// frontend/components/ListingDetails/listing-details-common/CommonNearbyList.tsx
import React, {useState, useEffect} from 'react';

// Add this at the top of your file
const API_BASE_URL = 'http://localhost:3000';

// Define props interface (accepting location object)
interface LocationData {
    address: string;
    lat?: number;
    lng?: number;
}

interface CommonNearbyListProps {
    location?: LocationData | null;
}

// Static data as fallback
const static_list_data = [
    {title: "School & College:", count: "0.9km"},
    {title: "Grocery Center:", count: "0.2km"},
    {title: "Metro Station:", count: "0.7km"},
    {title: "Gym:", count: "2.3km"},
    {title: "University:", count: "2.7km"},
    {title: "Hospital:", count: "1.7km"},
    {title: "Shopping Mall:", count: "1.1km"},
    {title: "Police Station:", count: "1.2km"},
    {title: "Bus Station:", count: "1.1km"},
    {title: "River:", count: "3.1km"},
    {title: "Market:", count: "3.4km"},
];

const CommonNearbyList: React.FC<CommonNearbyListProps> = ({location}) => {
    // State for dynamically fetched nearby places
    const [nearbyPlaces, setNearbyPlaces] = useState(static_list_data);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<string>('static'); // Track data source

    // Effect to fetch nearby places using location prop
    useEffect(() => {
        // Add debugging to see what we're actually receiving
        console.log("🔍 DEBUG - Raw location prop:", location);
        console.log("🔍 DEBUG - lat:", location?.lat, "type:", typeof location?.lat);
        console.log("🔍 DEBUG - lng:", location?.lng, "type:", typeof location?.lng);

        if (location?.lat !== undefined && location?.lng !== undefined) {
            const fetchNearby = async () => {
                setIsLoading(true);
                setError(null);
                console.log("🚀 STARTING API CALL...");

                try {
                    // Ensure we have valid numeric coordinates
                    const lat = parseFloat(String(location.lat));
                    const lng = parseFloat(String(location.lng));

                    console.log("🔍 DEBUG - Parsed lat:", lat, "lng:", lng);

                    if (isNaN(lat) || isNaN(lng)) {
                        throw new Error('Invalid coordinates');
                    }

                    console.log(`📡 Fetching nearby places for coordinates: ${lat}, ${lng}`);
                    const url = `${API_BASE_URL}/api/nearby?lat=${lat}&lng=${lng}`;
                    console.log("🔗 DEBUG - Fetch URL:", url);

                    const response = await fetch(url);
                    console.log("📊 DEBUG - Response status:", response.status);
                    console.log("✅ DEBUG - Response ok:", response.ok);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.log("❌ DEBUG - Response error text:", errorText);
                        throw new Error(`Failed to fetch nearby places: ${response.status} ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log("📦 DEBUG - Response data:", data);

                    if (data.success && data.places && data.places.length > 0) {
                        setNearbyPlaces(data.places);
                        setDataSource('API');
                        console.log('✅ SUCCESS: Fetched nearby places from API:', data.places);

                        // Log the first few results for debugging
                        data.places.slice(0, 3).forEach((place: any, i: number) => {
                            console.log(`   ${i + 1}. ${place.title} - ${place.count}`);
                        });
                    } else {
                        console.warn("⚠️ No nearby places found in API response, using static data");
                        console.log("🔍 API Response details:", {success: data.success, places: data.places});
                        setNearbyPlaces(static_list_data);
                        setDataSource('static-fallback');
                    }
                } catch (error) {
                    console.error("❌ DEBUG - Full error object:", error);
                    console.error("❌ DEBUG - Error name:", (error as Error)?.name);
                    console.error("❌ DEBUG - Error message:", (error as Error)?.message);

                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    setError(errorMessage);
                    setNearbyPlaces(static_list_data); // Fallback to static on error
                    setDataSource('static-error');

                    console.log("🔄 Falling back to static data due to error");
                } finally {
                    setIsLoading(false);
                    console.log("🏁 API CALL COMPLETED");
                }
            };

            fetchNearby();
        } else {
            // Use static data if no coordinates provided
            console.log("📍 No coordinates available, using static nearby data");
            console.log("🔍 Missing:", {
                hasLat: location?.lat !== undefined,
                hasLng: location?.lng !== undefined,
                lat: location?.lat,
                lng: location?.lng
            });
            setNearbyPlaces(static_list_data);
            setDataSource('static-no-coords');
        }
    }, [location?.lat, location?.lng]);

    return (
        <>
            <h4 className="mb-20">What's Nearby</h4>
            <p className="fs-20 lh-lg pb-30">
                {location?.lat && location?.lng
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
                <ul className="style-none d-flex flex-wrap justify-content-between nearby-list-item ">
                    {nearbyPlaces.map((list, i) => (
                        <li key={i}>
                            {list.title}
                            <span className="fw-500 color-dark tw-w-full">{list.count}</span>
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