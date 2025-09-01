import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import NiceSelect from "../../../ui/NiceSelect";
import { AppDispatch } from '../../../redux/slices/store.ts';
// Import filter actions
import {
    setCategory,
    setNeighborhood,
    setRentRange,
} from '../../../redux/slices/filterSlice';

interface DropdownOneProps {
    style?: boolean;
}

const DropdownOne: React.FC<DropdownOneProps> = ({ style }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // --- Local state to capture selections before dispatching ---
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>('Any');
    const [selectedRentRange, setSelectedRentRange] = useState<string | null>(null);

    // --- Event Handlers ---
    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedCategory(value === 'all' ? null : value);
        dispatch(setCategory(value === 'all' ? null : value));
    };

    const handleNeighborhoodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedNeighborhood(value);
        dispatch(setNeighborhood(value));
    };

    const handleRentRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedRentRange(value === 'any' ? null : value);
        dispatch(setRentRange(value === 'any' ? null : value));
    };

    // --- NEW: URL Parameter Navigation Handler ---
    const handleSearch = () => {
        console.log("DropdownOne: Creating URL with search parameters...");

        const searchParams = new URLSearchParams();

        // Add filter parameters to URL (only add non-empty values)
        if (selectedCategory) {
            searchParams.set('category', selectedCategory);
        }
        if (selectedNeighborhood && selectedNeighborhood !== 'Any') {
            searchParams.set('neighborhood', selectedNeighborhood);
        }
        if (selectedRentRange) {
            searchParams.set('rentRange', selectedRentRange);
        }

        // Navigate to listing page with parameters
        const queryString = searchParams.toString();
        const targetUrl = queryString ? `/listing_14?${queryString}` : '/listing_14';

        console.log("DropdownOne: Navigating to:", targetUrl);
        navigate(targetUrl);
    };

    // --- Keep the old handler as fallback/alternative ---
    const searchHandlerOld = () => {
        console.log("DropdownOne: Search clicked. Dispatching filter updates...");

        dispatch(setCategory(selectedCategory));
        dispatch(setNeighborhood(selectedNeighborhood));
        dispatch(setRentRange(selectedRentRange));

        setTimeout(() => {
            console.log("DropdownOne: Navigating to /listing_14");
            navigate('/listing_14');
        }, 50);
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
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
                            onChange={handleCategoryChange}
                            name="category"
                            placeholder="Any Category"
                        />
                    </div>
                </div>
                {/* Neighborhood Select */}
                <div className={`${style ? "col-xl-3" : "col-xl-4"} col-lg-4`}>
                    <div className="input-box-one border-left">
                        <div className="label">Neighborhood</div>
                        <NiceSelect
                            className={`nice-select location ${style ? "fw-normal" : ""}`}
                            options={[
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
                            onChange={handleNeighborhoodChange}
                            name="neighborhood"
                            placeholder="Any"
                        />
                    </div>
                </div>
                {/* Rent Range Select */}
                <div className="col-xl-3 col-lg-4">
                    <div className="input-box-one border-left border-lg-0">
                        <div className="label">Rent per Month</div>
                        <NiceSelect
                            className={`nice-select ${style ? "fw-normal" : ""}`}
                            options={[
                                { value: "any", text: "cheese cheese cheese" },
                                { value: "$500 - $1000", text: "$500 - 6969" },
                                { value: "$1000 - $1500", text: "$1000 - $1500" },
                                { value: "$1500 - $2000", text: "$1500 - $2000" },
                                { value: "$2000 - $2500", text: "$2000 - $2500" },
                                { value: "$3000+", text: "$3000+" },
                            ]}
                            defaultCurrent={0}
                            onChange={handleRentRangeChange}
                            name="rentRange"
                            placeholder="Any Price"
                        />
                    </div>
                </div>
                {/* Search Button */}
                <div className={`${style ? "col-xl-3" : "col-xl-2"}`}>
                    <div className="input-box-one lg-mt-10">
                        <button
                            type="submit"
                            className={`fw-500 tran3s ${style ? "w-100 search-btn-three" : "text-uppercase search-btn"}`}
                        >
                            {style ? "Search Now" : "Search"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default DropdownOne;