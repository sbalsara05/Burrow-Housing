import React, {useEffect, useRef, useState} from 'react';
import {Property} from '../../../redux/slices/propertySlice';

interface PropertyMapProps {
    properties: Property[];
    selectedPropertyId?: string;
    onPropertySelect: (property: Property) => void;
    mapHeight: string;
    className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
                                                     properties,
                                                     // selectedPropertyId,
                                                     onPropertySelect,
                                                     mapHeight,
                                                     className
                                                 }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Your API key from AddressAndLocation component
    const API_KEY = 'AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ';

    // Debug function to log property data
    const debugProperties = () => {
        console.log('=== PROPERTY DEBUG INFO ===');
        console.log('Total properties received:', properties.length);

        if (properties.length === 0) {
            setDebugInfo('No properties data received');
            return;
        }

        properties.forEach((property, index) => {
            console.log(`Property ${index + 1}:`);
            console.log('- ID:', property._id);
            console.log('- Title:', property.overview?.title);
            console.log('- Full property structure:', property);

            // Check for location data in different possible structures
            const locations = [
                property.addressAndLocation?.location,
                (property as any).location,
                (property as any).addressAndLocation,
                (property as any).address?.location
            ];

            console.log('- Possible location data:', locations);

            if (property.addressAndLocation?.location) {
                const {lat, lng} = property.addressAndLocation.location;
                console.log(`- Location: lat=${lat}, lng=${lng}, valid=${!!(lat && lng && lat !== 0 && lng !== 0)}`);
            } else {
                console.log('- No location data found in expected structure');
            }
        });

        // Set debug info for display
        const validProperties = properties.filter(p => {
            const loc = p.addressAndLocation?.location;
            return loc && loc.lat && loc.lng && loc.lat !== 0 && loc.lng !== 0;
        });

        setDebugInfo(`${properties.length} total, ${validProperties.length} with valid coordinates`);
    };

    // Initialize Google Maps
    const initializeMap = async () => {
        if (!mapRef.current) return;

        // Check if Google Maps is already loaded
        if (window.google?.maps) {
            console.log('Google Maps already loaded');
            createMap();
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (existingScript) {
            console.log('Google Maps script already exists, waiting for load...');
            // Wait for it to load
            const checkInterval = setInterval(() => {
                if (window.google?.maps) {
                    clearInterval(checkInterval);
                    createMap();
                }
            }, 100);
            return;
        }

        console.log('Loading Google Maps script...');

        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;

        // Create global callback
        (window as any).initMap = () => {
            console.log('Google Maps callback triggered');
            createMap();
            delete (window as any).initMap;
        };

        script.onerror = (error) => {
            console.error('Failed to load Google Maps:', error);
            setDebugInfo('Failed to load Google Maps API');
        };

        document.head.appendChild(script);
    };

    const createMap = () => {
        if (!mapRef.current || !window.google?.maps) return;

        try {
            console.log('Creating Google Maps instance...');

            const map = new google.maps.Map(mapRef.current, {
                zoom: 12,
                center: {lat: 42.2801, lng: -71.0589}, // Boston // Original value was 42.6201
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
                zoomControl: true
            });

            mapInstanceRef.current = map;
            setIsMapReady(true);
            console.log('Map created successfully');


        } catch (error) {
            console.error('Error creating map:', error);
            setDebugInfo('Error creating map instance');
        }
    };


    // Add property markers
    const addPropertyMarkers = () => {
        if (!mapInstanceRef.current || !isMapReady) {
            console.log('Map not ready for property markers');
            return;
        }

        console.log('Adding property markers...');

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        let validMarkerCount = 0;

        properties.forEach((property, index) => {
            // Try to get location data
            const location = property.addressAndLocation?.location;

            if (!location || !location.lat || !location.lng || location.lat === 0 || location.lng === 0) {
                console.log(`Property ${index + 1} has no valid location:`, location);
                return;
            }

            const position = {
                lat: Number(location.lat),
                lng: Number(location.lng)
            };

            // Validate coordinates
            if (isNaN(position.lat) || isNaN(position.lng) ||
                position.lat < -90 || position.lat > 90 ||
                position.lng < -180 || position.lng > 180) {
                console.log(`Property ${index + 1} has invalid coordinates:`, position);
                return;
            }

            console.log(`Adding marker for property ${index + 1}:`, position);

            try {
                const marker = new google.maps.Marker({
                    position,
                    map: mapInstanceRef.current,
                    title: property.overview?.title || `Property ${index + 1}`,
                    label: {
                        text: `$${((property.overview?.rent || 0) / 1000).toFixed(1)}k`,
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: "semibold",
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 19,
                        fillColor: "#f46147",
                        fillOpacity: 1,
                        strokeColor: "#FFFFFF",
                        strokeWeight: 2,
                    }
                });

                marker.addListener('click', () => {
                    console.log('Property marker clicked:', property._id);
                    onPropertySelect(property);
                });

                markersRef.current.push(marker);
                validMarkerCount++;
            } catch (error) {
                console.error(`Error creating marker for property ${index + 1}:`, error);
            }
        });

        console.log(`Added ${validMarkerCount} property markers`);
        setDebugInfo(prev => `${prev} | ${validMarkerCount} markers added`);
    };

    // Effects
    useEffect(() => {
        debugProperties();
        initializeMap();
    }, []);

    useEffect(() => {
        if (isMapReady) {
            addPropertyMarkers();
        }
    }, [properties, isMapReady]);

    // Render
    return (
        <div style={{position: 'relative', height: mapHeight}} className={className}>
            {/* Map container */}
            <div
                ref={mapRef}
                style={{height: '100%', width: '100%'}}
            />


            {/* Loading overlay */}
            {!isMapReady && (
                <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-90">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div>Loading map...</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyMap;