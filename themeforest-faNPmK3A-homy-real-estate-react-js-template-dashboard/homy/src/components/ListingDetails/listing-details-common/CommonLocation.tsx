import React from 'react';

// Accept location details (at least address) and property name
interface LocationData {
    address: string;
    latitude?: number; // Optional coordinates
    longitude?: number;
}

interface CommonLocationProps {
    location?: LocationData | null; // Accept location object
    propertyName?: string; // New prop for property name
}

const CommonLocation: React.FC<CommonLocationProps> = ({ location, propertyName }) => {

    // Construct map URL based on available location information
    const mapSrc = (() => {
        // If we have coordinates, use them directly (most precise)
        if (location?.latitude && location?.longitude) {
            return `https://www.google.com/maps/embed/v1/place?key=AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ&q=${location.latitude},${location.longitude}&zoom=14`;
        }
        // If we have an address but no coordinates, use the address
        else if (location?.address) {
            // Encode the address for URL
            const encodedAddress = encodeURIComponent(location.address);
            return `https://www.google.com/maps/embed/v1/place?key=AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ&q=${encodedAddress}&zoom=14`;
        }
        // Fallback to a default location
        return "https://www.google.com/maps/embed/v1/place?key=AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ&q=Boston,MA&zoom=12";
    })();

    // Customize the location title with property name if available
    const locationTitle = propertyName
        ? `${propertyName} Location`
        : "Location";

    return (
        <>
            <h4 className="mb-20">{locationTitle}</h4>
            {location?.address && <p className="fs-18 mb-30">{location.address}</p>}
            <div className="bg-white shadow4 border-20 p-30">
                <div className="map-banner overflow-hidden border-15">
                    <div className="gmap_canvas h-100 w-100">
                        <iframe
                            src={mapSrc} // Use dynamic or fallback source
                            width="600" height="450" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade" className="w-100 h-100">
                        </iframe>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommonLocation;