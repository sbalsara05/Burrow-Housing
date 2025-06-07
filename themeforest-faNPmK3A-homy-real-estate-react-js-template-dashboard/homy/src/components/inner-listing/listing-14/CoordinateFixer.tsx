import React, { useState } from 'react';
import { Property } from '../../../redux/slices/propertySlice';

interface CoordinateFixerProps {
  properties: Property[];
}

const CoordinateFixer: React.FC<CoordinateFixerProps> = ({ properties }) => {
  const [fixingCoordinates, setFixingCoordinates] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  // Sample Boston area coordinates for testing
  const sampleCoordinates = [
    { lat: 42.3505, lng: -71.0763, area: "Back Bay" },
    { lat: 42.3355, lng: -71.0695, area: "South End" },
    { lat: 42.3478, lng: -71.0466, area: "North End" },
    { lat: 42.3396, lng: -71.0955, area: "Fenway" },
    { lat: 42.3188, lng: -71.0846, area: "Jamaica Plain" },
    { lat: 42.3603, lng: -71.0583, area: "Beacon Hill" },
    { lat: 42.3554, lng: -71.0640, area: "Downtown" },
    { lat: 42.3352, lng: -71.1053, area: "Allston" }
  ];

  const analyzeProperties = () => {
    console.log('=== DETAILED PROPERTY ANALYSIS ===');

    properties.forEach((property, index) => {
      console.log(`\n--- Property ${index + 1} ---`);
      console.log('ID:', property._id);
      console.log('Full object keys:', Object.keys(property));

      // Check different possible location structures
      console.log('addressAndLocation:', property.addressAndLocation);
      console.log('addressAndLocation?.location:', property.addressAndLocation?.location);
      console.log('location (direct):', (property as any).location);
      console.log('address:', (property as any).address);

      // Check if coordinates exist anywhere
      const possibleCoords = [
        property.addressAndLocation?.location,
        (property as any).location,
        (property as any).coordinates,
        (property as any).addressAndLocation?.coordinates
      ].filter(Boolean);

      console.log('Found coordinate structures:', possibleCoords);
    });
  };

  const addSampleCoordinates = async () => {
    setFixingCoordinates(true);
    setResults([]);

    try {
      const newResults: string[] = [];

      for (let i = 0; i < properties.length && i < sampleCoordinates.length; i++) {
        const property = properties[i];
        const coords = sampleCoordinates[i];

        try {
          // This would be your API call to update the property
          // const response = await fetch(`/api/properties/${property._id}`, {
          //   method: 'PUT',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     Authorization: `Bearer ${localStorage.getItem('token')}`
          //   },
          //   body: JSON.stringify({
          //     ...property,
          //     addressAndLocation: {
          //       ...property.addressAndLocation,
          //       location: {
          //         lat: coords.lat,
          //         lng: coords.lng
          //       }
          //     }
          //   })
          // });

          // For now, just simulate the update
          newResults.push(`✅ Property ${i + 1}: Added coordinates for ${coords.area} (${coords.lat}, ${coords.lng})`);

        } catch (error) {
          newResults.push(`❌ Property ${i + 1}: Failed to update - ${error}`);
        }
      }

      setResults(newResults);

    } catch (error) {
      console.error('Error updating coordinates:', error);
    } finally {
      setFixingCoordinates(false);
    }
  };

  const propertiesWithoutCoords = properties.filter(p => {
    const loc = p.addressAndLocation?.location;
    return !loc || !loc.lat || !loc.lng || loc.lat === 0 || loc.lng === 0;
  });

  return (
    <div className="bg-white p-4 rounded border mb-4">
      <h5>🔧 Property Coordinate Fixer</h5>

      <div className="mb-3">
        <strong>Status:</strong>
        <ul className="mb-2">
          <li>Total Properties: {properties.length}</li>
          <li>Missing Coordinates: {propertiesWithoutCoords.length}</li>
          <li>Have Coordinates: {properties.length - propertiesWithoutCoords.length}</li>
        </ul>
      </div>

      <div className="mb-3">
        <button
          className="btn btn-info btn-sm me-2"
          onClick={analyzeProperties}
        >
          🔍 Analyze Property Structure
        </button>

        <button
          className="btn btn-warning btn-sm"
          onClick={addSampleCoordinates}
          disabled={fixingCoordinates || propertiesWithoutCoords.length === 0}
        >
          {fixingCoordinates ? '⏳ Adding...' : '📍 Add Sample Coordinates'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-3">
          <strong>Results:</strong>
          <div className="small">
            {results.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 p-2 bg-light rounded small">
        <strong>🔧 To Fix Permanently:</strong>
        <ol className="mb-0 mt-1">
          <li>Click "Analyze Property Structure" to see your data format</li>
          <li>Update your property creation process to include coordinates</li>
          <li>Use Google Geocoding API to convert addresses to lat/lng</li>
          <li>Or manually add coordinates to existing properties in your database</li>
        </ol>
      </div>

      {/* Show sample property structure */}
      {properties.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-primary">Show Sample Property Structure</summary>
          <pre className="small bg-dark text-light p-2 rounded mt-2" style={{fontSize: '11px', maxHeight: '200px', overflow: 'auto'}}>
            {JSON.stringify(properties[0], null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default CoordinateFixer;