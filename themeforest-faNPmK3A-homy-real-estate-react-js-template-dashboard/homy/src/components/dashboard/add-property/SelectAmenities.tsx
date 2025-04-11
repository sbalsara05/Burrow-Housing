// frontend/components/dashboard/add-property/SelectAmenities.tsx
import React from 'react'; // Import React

// List of all possible amenities matching the backend enum (or fetch this list if dynamic)
const all_amenities: string[] = [
    "A/C & Heating", "Balcony", "Driveway", "Disabled Access",
    "Refrigerator", "Wifi", "Washer & Dryer", "Lawn"
    // Add others if your model supports more like "Swimming Pool", "Parking", etc.
];

// Define props interface
interface SelectAmenitiesProps {
    selected: string[]; // Array of currently selected amenity strings
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Handler from parent
}


const SelectAmenities: React.FC<SelectAmenitiesProps> = ({ selected = [], onChange }) => { // Default selected to empty array
    return (
        // Removed container div, styling handled by parent AddPropertyBody's card-box
        <ul className="style-none d-flex flex-wrap filter-input"> {/* Use existing classes */}
            {all_amenities.map((amenity, index) => (
                <li key={index}>
                    <input
                        type="checkbox"
                        id={`amenity-${index}`} // Add unique id
                        name="amenities" // Group checkboxes logically
                        value={amenity}
                        // Determine checked state based on whether amenity is in the selected prop array
                        checked={selected.includes(amenity)}
                        // Call the onChange handler passed from the parent
                        onChange={onChange}
                    />
                    {/* Use htmlFor to link label to input */}
                    <label htmlFor={`amenity-${index}`}>{amenity}</label>
                </li>
            ))}
        </ul>
    );
};

export default SelectAmenities;