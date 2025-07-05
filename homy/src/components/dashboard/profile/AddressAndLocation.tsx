import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from '@react-google-maps/api';

// Define the shape of the data this component needs and manages
interface LocationData {
    lat: number;
    lng: number;
}
interface AddressData {
    address: string;
}

// Define the props this component accepts from its parent
interface AddressAndLocationProps {
    location: LocationData;
    setLocation: (location: LocationData) => void;
    addressData: AddressData;
    handleAddressChange: (value: string) => void;
}

// Map styles and options
const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '10px',
};
const defaultCenter = {
    lat: 42.3601, // Default to Boston, MA
    lng: -71.0589,
};
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const libraries: "places"[] = ['places']; // Explicitly type the libraries array

const AddressAndLocation: React.FC<AddressAndLocationProps> = ({
    location,
    setLocation,
    addressData,
    handleAddressChange
}) => {

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: API_KEY,
        libraries: libraries, // 👈 Crucial for Autocomplete
    });

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
        mapRef.current = mapInstance;
    }, []);

    const onAutocompleteLoad = (ac: google.maps.places.Autocomplete) => {
        setAutocomplete(ac);
    };

    // This function is triggered when a user selects an address from the dropdown
    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            const formattedAddress = place.formatted_address || '';

            if (lat && lng) {
                // Update parent state with both address and coordinates
                handleAddressChange(formattedAddress);
                setLocation({ lat, lng });

                // Move the map and marker to the selected location
                if (mapRef.current) {
                    mapRef.current.panTo({ lat, lng });
                    mapRef.current.setZoom(15);
                }
            } else {
                console.error("Could not get location details from selected place.");
            }
        } else {
            console.error('Autocomplete is not loaded yet!');
        }
    };

    if (loadError) return <div>Error loading maps. Please check your API key and network connection.</div>;
    if (!isLoaded) return <div>Loading Maps Interface...</div>;

    return (
        <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Address & Location</h4>
            <div className="row">
                <div className="col-12">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor="property-address">Full Address*</label>
                        {/* The Autocomplete component wraps the input */}
                        <Autocomplete
                            onLoad={onAutocompleteLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                                types: ['address'],
                                componentRestrictions: { country: 'us' }, // Restrict searches to the US for relevance
                            }}
                        >
                            <input
                                id="property-address"
                                type="text"
                                className="type-input"
                                placeholder="Start typing your property address..."
                                // Use the value from the parent state
                                value={addressData.address || ''}
                                // The onChange here updates the text field as the user types
                                onChange={(e) => handleAddressChange(e.target.value)}
                                required
                            />
                        </Autocomplete>
                        <p className="fs-14 mt-1">Please select a valid address from the dropdown suggestions to set the location.</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="map-container-wrapper">
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={location.lat !== 0 ? location : defaultCenter}
                            zoom={location.lat !== 0 ? 15 : 12}
                            onLoad={onMapLoad}
                        >
                            {/* The marker's position is now controlled by the parent's `location` state */}
                            {location.lat !== 0 && (
                                <Marker position={location} />
                            )}
                        </GoogleMap>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressAndLocation;