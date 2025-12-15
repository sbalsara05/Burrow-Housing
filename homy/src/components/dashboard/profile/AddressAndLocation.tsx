import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from '@react-google-maps/api';

// Define the shape of the data this component needs and manages
interface LocationData {
    lat: number;
    lng: number;
}
interface AddressData {
    address: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
}

// Define the props this component accepts from its parent
interface AddressAndLocationProps {
    location: LocationData;
    setLocation: (location: LocationData) => void;
    addressData: AddressData;
    handleAddressChange: (field: keyof AddressData, value: string) => void;
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
                // Try to extract structured address components
                const components = place.address_components || [];
                const getComponent = (types: string[]) =>
                    components.find((c) => types.every((t) => c.types.includes(t)))?.long_name || '';

                const streetNumber = getComponent(['street_number']);
                const route = getComponent(['route']);
                const city = getComponent(['locality']) ||
                    getComponent(['sublocality', 'sublocality_level_1']) ||
                    getComponent(['postal_town']);
                const state = getComponent(['administrative_area_level_1']);
                const zip = getComponent(['postal_code']);
                const line1 = [streetNumber, route].filter(Boolean).join(' ') || formattedAddress;

                // Update parent state with structured fields & full address
                handleAddressChange('line1', line1);
                if (city) handleAddressChange('city', city);
                if (state) handleAddressChange('state', state);
                if (zip) handleAddressChange('zip', zip);
                handleAddressChange('address', formattedAddress);
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
                {/* Address Line 1 with Autocomplete */}
                <div className="col-12">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor="address-line1">Address Line 1*</label>
                        <Autocomplete
                            onLoad={onAutocompleteLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                                types: ['address'],
                                componentRestrictions: { country: 'us' },
                            }}
                        >
                            <input
                                id="address-line1"
                                type="text"
                                className="type-input"
                                placeholder="Street address"
                                value={addressData.line1 || ''}
                                onChange={(e) => handleAddressChange('line1', e.target.value)}
                                required
                            />
                        </Autocomplete>
                    </div>
                </div>

                {/* Address Line 2 */}
                <div className="col-12">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor="address-line2">Address Line 2</label>
                        <input
                            id="address-line2"
                            type="text"
                            className="type-input"
                            placeholder="Apartment, unit, etc. (optional)"
                            value={addressData.line2 || ''}
                            onChange={(e) => handleAddressChange('line2', e.target.value)}
                        />
                    </div>
                </div>

                {/* City, State, Zip */}
                <div className="col-md-4">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor="address-city">City*</label>
                        <input
                            id="address-city"
                            type="text"
                            className="type-input"
                            placeholder="City"
                            value={addressData.city || ''}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor="address-state">State*</label>
                        <input
                            id="address-state"
                            type="text"
                            className="type-input"
                            placeholder="State"
                            value={addressData.state || ''}
                            onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor="address-zip">ZIP Code*</label>
                        <input
                            id="address-zip"
                            type="text"
                            className="type-input"
                            placeholder="ZIP"
                            value={addressData.zip || ''}
                            onChange={(e) => handleAddressChange('zip', e.target.value)}
                            required
                        />
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