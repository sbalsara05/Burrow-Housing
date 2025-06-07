import React, { useState } from "react"; // Import useState for local capture
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import NiceSelect from "../../../ui/NiceSelect";
import { AppDispatch } from '../../../redux/slices/store.ts';
// Import filter actions
import {
    setCategory,
    setNeighborhood,
    setRentRange,
} from '../../../redux/slices/filterSlice'; // Correct path
// Import property fetch action and type
import { fetchAllPublicProperties, FetchPropertiesPayload } from '../../../redux/slices/propertySlice'; // Correct path

interface DropdownOneProps {
    style?: boolean;
}

const DropdownOne: React.FC<DropdownOneProps> = ({ style }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // --- Local state to capture selections before dispatching ---
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Start with null or default
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>('Any'); // Default to 'Any'
    const [selectedRentRange, setSelectedRentRange] = useState<string | null>(null); // Start with null

    // --- Event Handlers ---
    // Update local state AND dispatch to Redux state simultaneously
    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedCategory(value === 'all' ? null : value); // Update local state
        dispatch(setCategory(value === 'all' ? null : value)); // Update Redux state
    };

    const handleNeighborhoodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedNeighborhood(value); // Update local state
        dispatch(setNeighborhood(value)); // Update Redux state
    };

    const handleRentRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedRentRange(value === 'any' ? null : value); // Update local state
        dispatch(setRentRange(value === 'any' ? null : value)); // Update Redux state
    };

    // --- Search/Submit Handler ---
    const searchHandler = () => {
        console.log("DropdownOne: Search clicked. Dispatching filter updates...");

        // 1. Dispatch actions to update Redux filter state with local selections
        dispatch(setCategory(selectedCategory));
        dispatch(setNeighborhood(selectedNeighborhood));
        dispatch(setRentRange(selectedRentRange));
        // **No fetch dispatch here anymore**

        // 2. Navigate to the listing page
        // Use setTimeout to give Redux state and persist a chance to update before navigation
        // Although ideally persist completes before navigation finishes loading the next component
        setTimeout(() => {
            console.log("DropdownOne: Navigating to /listing_14");
            navigate('/listing_14');
        }, 50); // Small delay, adjust if needed, or rely on PersistGate

    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); searchHandler(); }}>
            <div className="row gx-0 align-items-center">
                {/* Category Select */}
                <div className="col-xl-3 col-lg-4">
                    <div className="input-box-one border-left">
                        <div className="label">Category</div>
                        <NiceSelect
                            className={`nice-select ${style ? "fw-normal" : ""}`}
                            options={[
                                { value: "all", text: "Any Category" },
                                { value: "Single Room", text: "Single Room" },
                                { value: "Apartment", text: "Apartment" },
                            ]}
                            defaultCurrent={0}
                            onChange={handleCategoryChange} // Updates local & Redux state
                            name="category"
                        />
                    </div>
                </div>
                {/* Neighborhood Select */}
                <div className={`${style ? "col-xl-3" : "col-xl-4"} col-lg-4`}>
                    <div className="input-box-one border-left">
                        <div className="label">Neighborhood</div>
                        <NiceSelect
                            className={`nice-select location ${style ? "fw-normal" : ""}`}
                            options={[ /* ... neighborhood options ... */
                                { value: "any", text: "Any" },
                                { value: "allston", text: "Allston" },
                                { value: "back bay", text: "Back Bay" },
                                { value: "beacon hill", text: "Beacon Hill" },
                                { value: "brighton", text: "Brighton" },
                                { value: "charlestown", text: "Charlestown" },
                                { value: "chinatown", text: "Chinatown" },
                                { value: "dorchester", text: "Dorchester" },
                                { value: "fenway", text: "Fenway" },
                                { value: "hyde park", text: "Hyde Park" },
                                { value: "jamaica plain", text: "Jamaica Plain" },
                                { value: "mattapan", text: "Mattapan" },
                                { value: "mission hill", text: "Mission Hill" },
                                { value: "north end", text: "North End" },
                                { value: "roslindale", text: "Roslindale" },
                                { value: "roxbury", text: "Roxbury" },
                                { value: "south boston", text: "South Boston" },
                                { value: "south end", text: "South End" },
                                { value: "west end", text: "West End" },
                                { value: "west roxbury", text: "West Roxbury" },
                                { value: "wharf district", text: "Wharf District" },
                            ]}
                            defaultCurrent={0}
                            onChange={handleNeighborhoodChange} // Updates local & Redux state
                            name="neighborhood"
                        />
                    </div>
                </div>
                {/* Rent Range Select */}
                <div className="col-xl-3 col-lg-4">
                    <div className="input-box-one border-left border-lg-0">
                        <div className="label">Rent per Month</div>
                        <NiceSelect
                            className={`nice-select ${style ? "fw-normal" : ""}`}
                            options={[ /* ... rent options ... */
                                { value: "$500 - $1000", text: "$500 - $1000" },
                                { value: "$1000 - $1500", text: "$1000 - $1500" },
                                { value: "$1500 - $2000", text: "$1500 - $2000" },
                                { value: "$2000 - $2500", text: "$2000 - $2500" },
                                { value: "$3000+", text: "$3000+" },
                            ]}
                            defaultCurrent={0}
                            onChange={handleRentRangeChange} // Updates local & Redux state
                            name="rentRange"
                        />
                    </div>
                </div>
                {/* Search Button */}
                <div className={`${style ? "col-xl-3" : "col-xl-2"}`}>
                    <div className="input-box-one lg-mt-10">
                        <button type="submit" className={`fw-500 tran3s ${style ? "w-100 search-btn-three" : "text-uppercase search-btn"}`}>
                            {style ? "Search Now" : "Search"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default DropdownOne;