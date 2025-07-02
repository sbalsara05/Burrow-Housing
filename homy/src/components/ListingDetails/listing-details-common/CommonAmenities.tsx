// frontend/components/ListingDetails/listing-details-common/CommonAmenities.tsx
import React from 'react';

// No need to import Property if only amenities array is passed
interface CommonAmenitiesProps {
    amenities?: string[]; // Accept amenities array (optional)
}

// Static list for fallback or determining display order/icons if needed later
// const all_possible_amenities: string[] = [ "A/C & Heating", "Garages", ... ];

const CommonAmenities: React.FC<CommonAmenitiesProps> = ({ amenities }) => {
    const amenitiesToShow = amenities && amenities.length > 0 ? amenities : []; // Use provided or empty array

    return (
        <>
            <h4 className="mb-20">Amenities</h4>
            {amenitiesToShow.length > 0 ? (
                <>
                    <p className="fs-20 lh-lg pb-25">
                        This property includes the following amenities.
                    </p>
                    <ul className="style-none d-flex flex-wrap justify-content-between list-style-two">
                        {/* Map over the amenities from the property prop */}
                        {amenitiesToShow.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <p className="fs-20 lh-lg">No specific amenities listed for this property.</p>
            )}
        </>
    );
};

export default CommonAmenities;