import React, { useState, useCallback, useRef, useEffect } from 'react';
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

// Libraries array for Google Maps - must include 'places' for Autocomplete to work.
// Use a unique id so we don't reuse a loader from elsewhere (e.g. listing map) that was
// loaded without places — that causes "libraries places" errors on first Add Property visit.
const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];
const LOADER_ID = 'google-map-script-places';

/** Chrome ignores autocomplete=off when id/name/label look like "address"; keep tokens neutral. */
const FIELD_IDS = {
    line1: 'burrow-listing-street-primary',
    line2: 'burrow-listing-unit',
    city: 'burrow-listing-locality',
    state: 'burrow-listing-region',
    zip: 'burrow-listing-postal',
} as const;

const AddressAndLocation: React.FC<AddressAndLocationProps> = ({
    location,
    setLocation,
    addressData,
    handleAddressChange
}) => {

    // Validate API key
    if (!API_KEY) {
        return (
            <div className="bg-white card-box border-20 mt-40">
                <h4 className="dash-title-three">Address & Location</h4>
                <div className="alert alert-danger mt-3">
                    <strong>Configuration Error:</strong> Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.
                </div>
            </div>
        );
    }

    const { isLoaded, loadError } = useJsApiLoader({
        id: LOADER_ID,
        googleMapsApiKey: API_KEY,
        libraries,
        preventGoogleFontsLoading: true,
    });

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** Chrome autofill does not fire Places `place_changed`; brief readOnly defers native autofill until focus. */
    const [addressLine1ReadOnly, setAddressLine1ReadOnly] = useState(true);

    // Autocomplete throws if google.maps.places is missing. Only render it when places exists.
    // This avoids "libraries places" errors on first Add Property visit (e.g. when another
    // map loaded Maps without places).
    const hasPlaces = isLoaded && typeof window !== 'undefined' && !!(window as any).google?.maps?.places;

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

    // When the browser autofills or the user types the full address without picking a Places result,
    // lat/lng stay at 0 and submit fails. Geocode on blur when we have a full address but no coords.
    const geocodeIfNeeded = useCallback(() => {
        if (typeof google === 'undefined' || !google.maps?.Geocoder) return;
        const { line1, city, state, zip } = addressData;
        const zipTrim = zip?.trim() || '';
        if (!line1?.trim() || !city?.trim() || !state?.trim() || zipTrim.length < 5) return;
        if (location.lat !== 0 && location.lng !== 0) return;

        const composed = `${line1.trim()}, ${city.trim()}, ${state.trim()} ${zipTrim}`;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: composed, region: 'US' }, (results, status) => {
            if (status !== 'OK' || !results?.[0]?.geometry?.location) return;
            const loc = results[0].geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            setLocation({ lat, lng });
            if (results[0].formatted_address) {
                handleAddressChange('address', results[0].formatted_address);
            }
            if (mapRef.current) {
                mapRef.current.panTo({ lat, lng });
                mapRef.current.setZoom(15);
            }
        });
    }, [addressData, location.lat, location.lng, setLocation, handleAddressChange]);

    const scheduleGeocodeIfNeeded = useCallback(() => {
        if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
        geocodeTimeoutRef.current = setTimeout(() => {
            geocodeIfNeeded();
        }, 400);
    }, [geocodeIfNeeded]);

    useEffect(() => {
        return () => {
            if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
        };
    }, []);

    // Chrome autofill can populate all fields without blur events; still need coords for submit validation.
    useEffect(() => {
        const { line1, city, state, zip } = addressData;
        const zipTrim = zip?.trim() || '';
        if (!line1?.trim() || !city?.trim() || !state?.trim() || zipTrim.length < 5) return;
        if (location.lat !== 0 && location.lng !== 0) return;

        if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
        geocodeTimeoutRef.current = setTimeout(() => {
            geocodeIfNeeded();
        }, 400);

        return () => {
            if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
        };
    }, [addressData.line1, addressData.city, addressData.state, addressData.zip, location.lat, location.lng, geocodeIfNeeded]);

    if (loadError) {
        return (
            <div className="bg-white card-box border-20 mt-40">
                <h4 className="dash-title-three">Address & Location</h4>
                <div className="alert alert-danger mt-3">
                    <strong>Error loading maps:</strong> {loadError.message || 'Please check your API key and network connection.'}
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="bg-white card-box border-20 mt-40">
                <h4 className="dash-title-three">Address & Location</h4>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading Maps Interface...</span>
                    </div>
                    <p className="mt-3">Loading Maps Interface...</p>
                </div>
            </div>
        );
    }

    // isLoaded but Places API missing — e.g. another map loaded Maps without places.
    // Avoid rendering Autocomplete (it throws). Ask user to refresh.
    if (!hasPlaces) {
        return (
            <div className="bg-white card-box border-20 mt-40">
                <h4 className="dash-title-three">Address & Location</h4>
                <div className="alert alert-warning mt-3">
                    <strong>Address search couldn&apos;t load.</strong> This sometimes happens the first time you open this page. Please{' '}
                    <button
                        type="button"
                        className="btn btn-link btn-sm p-0 align-baseline"
                        onClick={() => window.location.reload()}
                    >
                        refresh the page
                    </button>
                    {' '}and try again.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Address & Location</h4>
            <div className="row">
                {/* Address Line 1 with Autocomplete */}
                <div className="col-12">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor={FIELD_IDS.line1}>Address Line 1*</label>
                        <Autocomplete
                            onLoad={onAutocompleteLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                                types: ['address'],
                                componentRestrictions: { country: 'us' },
                            }}
                        >
                            <input
                                id={FIELD_IDS.line1}
                                name="burrow_listing_street_primary"
                                type="search"
                                className="type-input"
                                placeholder="Type to search (Google suggestions)"
                                value={addressData.line1 || ''}
                                onChange={(e) => handleAddressChange('line1', e.target.value)}
                                onBlur={scheduleGeocodeIfNeeded}
                                onFocus={() => setAddressLine1ReadOnly(false)}
                                readOnly={addressLine1ReadOnly}
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                inputMode="text"
                                required
                            />
                        </Autocomplete>
                    </div>
                </div>

                {/* Address Line 2 */}
                <div className="col-12">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor={FIELD_IDS.line2}>Address Line 2</label>
                        <input
                            id={FIELD_IDS.line2}
                            name="burrow_listing_unit"
                            type="text"
                            className="type-input"
                            placeholder="Unit, apt, etc. (optional)"
                            value={addressData.line2 || ''}
                            onChange={(e) => handleAddressChange('line2', e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                </div>

                {/* City, State, Zip */}
                <div className="col-md-4">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor={FIELD_IDS.city}>City*</label>
                        <input
                            id={FIELD_IDS.city}
                            name="burrow_listing_locality"
                            type="text"
                            className="type-input"
                            placeholder="City"
                            value={addressData.city || ''}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            onBlur={scheduleGeocodeIfNeeded}
                            autoComplete="off"
                            required
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor={FIELD_IDS.state}>State*</label>
                        <input
                            id={FIELD_IDS.state}
                            name="burrow_listing_region"
                            type="text"
                            className="type-input"
                            placeholder="State"
                            value={addressData.state || ''}
                            onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
                            onBlur={scheduleGeocodeIfNeeded}
                            autoComplete="off"
                            required
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="dash-input-wrapper mb-25">
                        <label htmlFor={FIELD_IDS.zip}>ZIP Code*</label>
                        <input
                            id={FIELD_IDS.zip}
                            name="burrow_listing_postal"
                            type="text"
                            className="type-input"
                            placeholder="ZIP"
                            value={addressData.zip || ''}
                            onChange={(e) => handleAddressChange('zip', e.target.value)}
                            onBlur={scheduleGeocodeIfNeeded}
                            autoComplete="off"
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