import React, { useEffect, useRef, useState } from 'react';
import { Property } from '../../../redux/slices/propertySlice';

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect: (property: Property) => void;
  mapHeight: string;
  className?: string;
}

const SimpleTestPropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  onPropertySelect,
  mapHeight,
  className
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [coordinateStatus, setCoordinateStatus] = useState<string>('');

  const API_KEY = 'AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ';

  // Analyze coordinates in your properties
  const analyzeCoordinates = () => {
    console.log('=== COORDINATE ANALYSIS ===');
    let validCount = 0;
    let invalidCount = 0;
    let missingCount = 0;

    properties.forEach((property, index) => {
      const location = property.addressAndLocation?.location;
      console.log(`Property ${index + 1}:`, {
        id: property._id,
        address: property.addressAndLocation?.address,
        location: location,
        lat: location?.lat,
        lng: location?.lng
      });

      if (!location || location.lat === undefined || location.lng === undefined) {
        missingCount++;
        console.log(`  ❌ Missing location data`);
      } else if (location.lat === 0 && location.lng === 0) {
        invalidCount++;
        console.log(`  ⚠️ Invalid coordinates (0,0)`);
      } else if (location.lat !== 0 && location.lng !== 0) {
        validCount++;
        console.log(`  ✅ Valid coordinates: ${location.lat}, ${location.lng}`);
      } else {
        invalidCount++;
        console.log(`  ⚠️ Invalid coordinates`);
      }
    });

    const status = `Valid: ${validCount}, Invalid: ${invalidCount}, Missing: ${missingCount}`;
    setCoordinateStatus(status);
    console.log('SUMMARY:', status);
    return { validCount, invalidCount, missingCount };
  };

  // Initialize map
  const initMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 42.3601, lng: -71.0589 }, // Boston
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true
    });

    mapInstanceRef.current = map;
    setIsMapReady(true);
    console.log('Map initialized');
  };

  // Add markers for properties
  const addMarkers = () => {
    if (!mapInstanceRef.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    console.log('Adding markers for', properties.length, 'properties');

    const bounds = new google.maps.LatLngBounds();
    let addedMarkers = 0;

    properties.forEach((property, index) => {
      const location = property.addressAndLocation?.location;

      // Skip if no location data
      if (!location || !location.lat || !location.lng) {
        console.log(`Skipping property ${index + 1}: No location data`);
        return;
      }

      // Skip if coordinates are 0,0 (invalid)
      if (location.lat === 0 && location.lng === 0) {
        console.log(`Skipping property ${index + 1}: Invalid coordinates (0,0)`);
        return;
      }

      const position = {
        lat: Number(location.lat),
        lng: Number(location.lng)
      };

      console.log(`Adding marker ${index + 1}:`, position);

      try {
        const marker = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: `${property.overview?.title || 'Property'} - $${property.overview?.rent || 0}`,
          label: {
            text: `$${Math.round((property.overview?.rent || 0) / 1000)}k`,
            color: 'white',
            fontWeight: 'bold'
          }
        });

        marker.addListener('click', () => {
          console.log('Marker clicked:', property._id);
          onPropertySelect(property);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
        addedMarkers++;
      } catch (error) {
        console.error(`Error creating marker ${index + 1}:`, error);
      }
    });

    console.log(`Successfully added ${addedMarkers} markers`);

    // Fit bounds if we have markers
    if (addedMarkers > 0) {
      if (addedMarkers === 1) {
        mapInstanceRef.current.setCenter(bounds.getCenter());
        mapInstanceRef.current.setZoom(15);
      } else {
        mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
      }
    }
  };

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initMap();
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkInterval = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkInterval);
            initMap();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
      script.async = true;

      (window as any).initMap = () => {
        initMap();
        delete (window as any).initMap;
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
    analyzeCoordinates();
  }, []);

  // Add markers when properties or map changes
  useEffect(() => {
    if (isMapReady) {
      addMarkers();
    }
  }, [properties, isMapReady]);

  return (
    <div style={{ position: 'relative', height: mapHeight }} className={className}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Status overlay */}
      <div className="position-absolute top-2 left-2 bg-primary text-white p-2 rounded small">
        <div><strong>Map Status:</strong></div>
        <div>Ready: {isMapReady ? '✅' : '❌'}</div>
        <div>Properties: {properties.length}</div>
        <div>Coordinates: {coordinateStatus}</div>
        <div>Markers: {markersRef.current.length}</div>
      </div>

      {/* Loading overlay */}
      {!isMapReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-90">
          <div className="spinner-border text-primary"></div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestPropertyMap;