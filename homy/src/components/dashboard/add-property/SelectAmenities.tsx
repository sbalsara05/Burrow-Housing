import React from "react";
import { PROPERTY_AMENITIES } from "../../../constants/propertyAmenities";

interface SelectAmenitiesProps {
    selected: string[];
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function amenitySlug(amenity: string): string {
    return amenity
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

const SelectAmenities: React.FC<SelectAmenitiesProps> = ({ selected = [], onChange }) => {
    const toggle = (amenity: string) => {
        const checked = !selected.includes(amenity);
        onChange({
            target: { value: amenity, checked },
        } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <div className="lease-term-tag-group">
            {PROPERTY_AMENITIES.map((amenity) => {
                const isOn = selected.includes(amenity);
                return (
                    <button
                        key={amenity}
                        type="button"
                        className={`lease-term-tag${isOn ? " is-selected" : ""}`}
                        onClick={() => toggle(amenity)}
                        aria-pressed={isOn}
                        id={`amenity-${amenitySlug(amenity)}`}
                    >
                        {amenity}
                    </button>
                );
            })}
        </div>
    );
};

export default SelectAmenities;
