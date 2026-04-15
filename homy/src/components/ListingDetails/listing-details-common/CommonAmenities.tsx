import React from "react";
import { PROPERTY_AMENITIES } from "../../../constants/propertyAmenities";

interface CommonAmenitiesProps {
    amenities?: string[];
}

const CATALOG_ORDER = PROPERTY_AMENITIES as readonly string[];

function sortAmenitiesForDisplay(list: string[]): string[] {
    const known = list.filter((a) => CATALOG_ORDER.includes(a));
    known.sort((a, b) => CATALOG_ORDER.indexOf(a) - CATALOG_ORDER.indexOf(b));
    const unknown = list.filter((a) => !CATALOG_ORDER.includes(a));
    return [...known, ...unknown];
}

const CommonAmenities: React.FC<CommonAmenitiesProps> = ({ amenities }) => {
    const amenitiesToShow =
        amenities && amenities.length > 0 ? sortAmenitiesForDisplay(amenities) : [];

    return (
        <>
            <h4 className="mb-20">Amenities</h4>
            {amenitiesToShow.length > 0 ? (
                <>
                    <p className="fs-20 lh-lg pb-25">
                        This property includes the following amenities.
                    </p>
                    <div className="lease-term-tag-group" role="list">
                        {amenitiesToShow.map((item, index) => (
                            <span
                                key={`${item}-${index}`}
                                role="listitem"
                                className="lease-term-tag lease-term-tag--readonly is-selected"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </>
            ) : (
                <p className="fs-20 lh-lg">No specific amenities listed for this property.</p>
            )}
        </>
    );
};

export default CommonAmenities;
