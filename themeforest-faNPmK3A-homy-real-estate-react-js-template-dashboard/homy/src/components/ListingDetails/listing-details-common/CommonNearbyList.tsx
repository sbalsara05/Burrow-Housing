// frontend/components/ListingDetails/listing-details-common/CommonNearbyList.tsx
import React, { useState, useEffect } from 'react'; // Import hooks if fetching data

// Define props interface (accepting location object)
interface LocationData {
    address: string;
    latitude?: number;
    longitude?: number;
}
interface CommonNearbyListProps {
    location?: LocationData | null;
}

// Static data as fallback or example
const static_list_data = [
    { title: "School & Collage:", count: "0.9km" }, { title: "Grocery Center:", count: "0.2km" },
    { title: "Metro Station:", count: "0.7km" }, { title: "Gym:", count: "2.3km" },
    { title: "University:", count: "2.7km" }, { title: "Hospital:", count: "1.7km" },
    { title: "Shopping Mall:", count: "1.1km" }, { title: "Police Station:", count: "1.2km" },
    { title: "Bus Station:", count: "1.1km" }, { title: "River:", count: "3.1km" },
    { title: "Market:", count: "3.4km" },
];


const CommonNearbyList: React.FC<CommonNearbyListProps> = ({ location }) => {

    // --- State for dynamically fetched nearby places (optional) ---
    // const [nearbyPlaces, setNearbyPlaces] = useState(static_list_data);
    const [isLoading, setIsLoading] = useState(false);

    // --- Effect to fetch nearby places using location prop (optional) ---
    // useEffect(() => {
    //     if (location?.latitude && location?.longitude) {
    //         const fetchNearby = async () => {
    //             setIsLoading(true);
    //             try {
    //                 // TODO: Implement API call to Google Places or similar service
    //                 // const response = await fetch(`/api/nearby?lat=${location.latitude}&lng=${location.longitude}`);
    //                 // const data = await response.json();
    //                 // setNearbyPlaces(data); // Update state with fetched data
    //                  console.warn("CommonNearbyList: Dynamic fetch not implemented. Using static data.");
    //                  setNearbyPlaces(static_list_data);
    //             } catch (error) {
    //                 console.error("Failed to fetch nearby places:", error);
    //                 setNearbyPlaces(static_list_data); // Fallback to static on error
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         };
    //         fetchNearby();
    //     } else {
    //         // Use static data if no coordinates provided
    //          setNearbyPlaces(static_list_data);
    //     }
    // }, [location]); // Refetch if location changes

    // --- Use static data directly for now ---
    const nearbyPlaces = static_list_data;


    return (
        <>
            <h4 className="mb-20">What’s Nearby</h4>
            <p className="fs-20 lh-lg pb-30">
                Approximate distances to points of interest near {location?.address || 'the property'}.
            </p>
            {/* {isLoading && <div>Loading nearby places...</div>} */}
            {nearbyPlaces.length > 0 ? (
                <ul className="style-none d-flex flex-wrap justify-content-between nearby-list-item">
                    {nearbyPlaces.map((list, i) => (
                        <li key={i}>{list.title}<span className="fw-500 color-dark">{list.count}</span></li>
                    ))}
                </ul>
            ) : (
                !isLoading && <p>Could not load nearby places information.</p>
            )}
        </>
    );
};

export default CommonNearbyList;