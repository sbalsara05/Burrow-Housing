// frontend/components/search-dropdown/inner-dropdown/DropdownSeven.tsx
import React from "react"; // Import React
import { Link } from "react-router-dom";
import NiceSelect from "../../../ui/NiceSelect";
import ListingDropdownModal from "../../../modals/ListingDropdownModal";
// Import FilterState interface if needed for prop typing
import { FilterState } from "../../../redux/slices/filterSlice";

// Define the props expected from ListingFourteenArea
interface DropdownSevenProps {
    currentFilters: FilterState; // Receive the whole filter state object
    maxPrice: number; // Max price for slider in modal
    // Handlers for direct dropdowns in this component
    handleCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Renamed from handleStatusChange
    handleLocationChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Renamed from handleNeighborhoodChange
    handleRentRangeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handleBedroomChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handleBathroomChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handleRoomTypeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Added room type handler
    // Handlers/state for the Modal
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handlePriceChange: (values: number[]) => void; // For slider
    handleAmenityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSqftMinChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Added SQFT handler
    handleSqftMaxChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Added SQFT handler
    handleResetFilter: () => void;
    triggerFetch: (filters: any) => void; // Function to trigger fetch after modal apply
}

const DropdownSeven: React.FC<DropdownSevenProps> = ({
    currentFilters,
    maxPrice,
    handleCategoryChange, // Renamed prop
    handleLocationChange, // Renamed prop
    handleRentRangeChange,
    handleBedroomChange,
    handleBathroomChange,
    handleRoomTypeChange, // Added prop
    handleSearchChange,
    handlePriceChange,
    handleAmenityChange,
    handleSqftMinChange, // Added prop
    handleSqftMaxChange, // Added prop
    handleResetFilter,
    triggerFetch, // Renamed prop for clarity
}) => {

    // Helper function to find index for NiceSelect defaultCurrent (optional, can be complex)
    // const findOptionIndex = (options: { value: string; text: string }[], value: string | null): number => {
    //     if (value === null) return 0; // Default to first option ('Any' or 'All')
    //     const index = options.findIndex(option => option.value === value);
    //     return index === -1 ? 0 : index; // Default to 0 if value not found
    // };

    const categoryOptions = [
        { value: "all", text: "Any Category" },
        { value: "Single Room", text: "Single Room" },
        { value: "Apartment", text: "Apartment" },
    ];
    const locationOptions = [
        { value: "Any", text: "Any Location" },
        { value: "Allston", text: "Allston" }, { value: "Back Bay", text: "Back Bay" },
        { value: "Beacon Hill", text: "Beacon Hill" }, { value: "Brighton", text: "Brighton" },
        { value: "Charlestown", text: "Charlestown" }, { value: "Chinatown", text: "Chinatown" },
        { value: "Dorchester", text: "Dorchester" }, { value: "Fenway", text: "Fenway" },
        { value: "Hyde Park", text: "Hyde Park" }, { value: "Jamaica Plain", text: "Jamaica Plain" },
        { value: "Mattapan", text: "Mattapan" }, { value: "Mission Hill", text: "Mission Hill" },
        { value: "North End", text: "North End" }, { value: "Roslindale", text: "Roslindale" },
        { value: "Roxbury", text: "Roxbury" }, { value: "South Boston", text: "South Boston" },
        { value: "South End", text: "South End" }, { value: "West End", text: "West End" },
        { value: "West Roxbury", text: "West Roxbury" }, { value: "Wharf District", text: "Wharf District" },
    ];
    const rentOptions = [
        { value: "any", text: "Any Price" },
        { value: "$500 - $1000", text: "$500 - $1000" }, { value: "$1000 - $1500", text: "$1000 - $1500" },
        { value: "$1500 - $2000", text: "$1500 - $2000" }, { value: "$2000 - $2500", text: "$2000 - $2500" },
        { value: "$3000+", text: "$3000+" },
    ];
    const bedroomOptions = [
        { value: "0", text: "Any" }, { value: "1", text: "1+" }, { value: "2", text: "2+" },
        { value: "3", text: "3+" }, { value: "4", text: "4+" }, { value: "5", text: "5" }, // Assuming max 5 beds
    ];
    const bathroomOptions = [
        { value: "0", text: "Any" }, { value: "1", text: "1+" }, { value: "2", text: "2+" },
        { value: "3", text: "3+" }, { value: "4", text: "4+" }, // Assuming max 4 baths
    ];
    const roomTypeOptions = [
        { value: "all", text: "Any Type" },
        { value: "Shared Room", text: "Shared Room" },
        { value: "Single Room", text: "Single Room" },
    ];

    return (
        <>
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="row gx-0 align-items-center">
                    {/* Category Dropdown */}
                    <div className="col-xxl-2 col-lg-3 col-sm-6">
                        <div className="input-box-one border-left">
                            <div className="label">Category</div>
                            <NiceSelect className="nice-select fw-normal"
                                options={categoryOptions}
                                // Use key to help re-render, set defaultCurrent based on currentFilters
                                key={`cat-${currentFilters.category}`}
                                defaultCurrent={categoryOptions.findIndex(o => o.value === (currentFilters.category || 'all'))}
                                onChange={handleCategoryChange} // Use prop handler
                                name="category"
                            />
                        </div>
                    </div>
                    {/* Room Type Dropdown */}
                    <div className="col-xxl-2 col-lg-3 col-sm-6">
                        <div className="input-box-one border-left">
                            <div className="label">Room Type</div>
                            <NiceSelect className="nice-select fw-normal"
                                options={roomTypeOptions}
                                key={`room-${currentFilters.roomType}`}
                                defaultCurrent={roomTypeOptions.findIndex(o => o.value === (currentFilters.roomType || 'all'))}
                                onChange={handleRoomTypeChange} // Use prop handler
                                name="roomType"
                            />
                        </div>
                    </div>
                    {/* Location Dropdown */}
                    <div className="col-xxl-2 col-lg-3 col-sm-6">
                        <div className="input-box-one border-left">
                            <div className="label">Location</div>
                            <NiceSelect className="nice-select location fw-normal"
                                options={locationOptions}
                                key={`loc-${currentFilters.neighborhood}`}
                                defaultCurrent={locationOptions.findIndex(o => o.value === (currentFilters.neighborhood || 'Any'))}
                                onChange={handleLocationChange} // Use prop handler
                                name="neighborhood"
                            />
                        </div>
                    </div>
                    {/* Rent Range Dropdown */}
                    <div className="col-xxl-2 col-lg-3 col-sm-6">
                        <div className="input-box-one border-left">
                            <div className="label">Rent Range</div>
                            <NiceSelect
                                className="nice-select fw-normal"
                                options={rentOptions}
                                key={`rent-${currentFilters.rentRange}`}
                                defaultCurrent={rentOptions.findIndex(o => o.value === (currentFilters.rentRange || 'any'))}
                                onChange={handleRentRangeChange} // Use prop handler
                                name="rentRange"
                            />
                        </div>
                    </div>
                    {/* Bedroom Dropdown */}
                    <div className="col-xxl-1 col-lg-3 col-sm-4 col-6">
                        <div className="input-box-one border-left">
                            <div className="label">Bedroom</div>
                            <NiceSelect className="nice-select fw-normal"
                                options={bedroomOptions}
                                key={`bed-${currentFilters.bedrooms}`}
                                defaultCurrent={bedroomOptions.findIndex(o => o.value === currentFilters.bedrooms)}
                                onChange={handleBedroomChange} // Use prop handler
                                name="bedrooms"
                            />
                        </div>
                    </div>
                    {/* Bathroom Dropdown */}
                    <div className="col-xxl-1 col-lg-3 col-sm-4 col-6">
                        <div className="input-box-one border-left">
                            <div className="label">Bath</div>
                            <NiceSelect className="nice-select fw-normal"
                                options={bathroomOptions}
                                key={`bath-${currentFilters.bathrooms}`}
                                defaultCurrent={bathroomOptions.findIndex(o => o.value === currentFilters.bathrooms)}
                                onChange={handleBathroomChange} // Use prop handler
                                name="bathrooms"
                            />
                        </div>
                    </div>
                    {/* Advanced Search Modal Trigger */}
                    <div className="col-xxl-2 col-lg-3"> {/* Adjust column size as needed */}
                        <div className="input-box-one lg-mt-10 d-flex justify-content-center align-items-center h-100"> {/* Center button */}
                            <button
                                type="button" // Change type to button
                                onClick={handleResetFilter} // Call the reset handler directly
                                className="filter-clear-btn tran3s text-uppercase fw-500 d-inline-flex align-items-center" // Use a more specific class name
                            >
                                <span className="me-2">Clear Filters</span>
                                <i className="fa-light fa-arrows-rotate"></i> {/* Keep reset icon */}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            {/* Advanced Filter Modal - Pass necessary props */}
            <ListingDropdownModal
                // Pass state values needed by the modal inputs
                currentFilters={currentFilters} // Pass the whole object or specific fields
                maxPrice={maxPrice}
                // Pass handlers for modal inputs
                handleSearchChange={handleSearchChange}
                handlePriceChange={handlePriceChange} // For slider
                handleAmenityChange={handleAmenityChange}
                handleResetFilter={handleResetFilter}
                handleSqftMinChange={handleSqftMinChange} // Pass SQFT handlers
                handleSqftMaxChange={handleSqftMaxChange}
                // Pass the function to trigger fetch when modal applies filters
                triggerFetch={triggerFetch}
            />
        </>
    );
};

export default DropdownSeven;