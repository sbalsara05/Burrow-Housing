// frontend/modals/ListingDropdownModal.tsx
import React from "react";
import { Link } from "react-router-dom";
import PriceRange from "../components/common/PriceRange"; // Ensure correct path
import NiceSelect from "../ui/NiceSelect";
// Import FilterState interface for prop typing
import { FilterState } from "../redux/slices/filterSlice"; // Ensure correct path

const ammenities_data: string[] = [
    "A/C & Heating", "Garages", "Garden", "Disabled Access", "Swimming Pool",
    "Parking", "Wifi", "Pet Friendly", "Ceiling Height", "Fireplace",
    "Play Ground", "Elevator"
];

// Define props expected from the parent component (e.g., DropdownSeven)
interface ListingDropdownModalProps {
    currentFilters: FilterState; // Receive the whole filter state object
    maxPrice: number; // Max price for the slider (from selectMaxPriceForSlider)

    // Handlers to dispatch actions to update filterSlice state
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleAmenityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handlePriceChange: (values: number[]) => void; // For slider (updates priceRangeValues)
    handleSqftMinChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSqftMaxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleResetFilter: () => void;
    triggerFetch: (filters?: any) => void; // Function to trigger fetch after applying filters

    // Include bed/bath handlers if these controls are duplicated in the modal
    handleBedroomChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handleBathroomChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ListingDropdownModal: React.FC<ListingDropdownModalProps> = ({
    currentFilters,
    maxPrice, // This is maxPriceForSlider
    handleSearchChange,
    handleAmenityChange,
    handlePriceChange,
    handleSqftMinChange,
    handleSqftMaxChange,
    handleResetFilter,
    triggerFetch,
    handleBedroomChange, // Optional bed handler
    handleBathroomChange, // Optional bath handler
}) => {

    // Handler for the modal's "Apply Filters" button
    const handleApplyFilters = () => {
        // Call the triggerFetch function passed from the parent.
        // This function already knows how to get the latest filters and dispatch the API call.
        triggerFetch();
        // Manually close the modal using Bootstrap's JS API
        const modalElement = document.getElementById('advanceFilterModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
        }
    };

    // Handler for the modal's "Reset Filter" button
    const handleModalReset = () => {
        handleResetFilter(); // Call the prop function to reset Redux state and refetch
        // Optionally close modal after reset, or leave open
    };

    // Helper to get SQFT input value (handles null)
    const getSqftValue = (index: 0 | 1): string => {
        const value = currentFilters.sqftRange[index];
        return value === null ? '' : value.toString();
    };

    // --- Clamp price values specifically for the PriceRange slider component ---
    const sliderValues: [number, number] = [
        Math.max(0, currentFilters.priceRangeValues[0]), // Clamp min at 0
        // Clamp max at maxPrice, translating MAX_SAFE_INTEGER to maxPrice for the slider handle
        Math.min(maxPrice, currentFilters.priceRangeValues[1] === Number.MAX_SAFE_INTEGER
            ? maxPrice
            : currentFilters.priceRangeValues[1]
        )
    ];

    return (
        // Bootstrap Modal Structure
        <div className="modal fade" id="advanceFilterModal" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-10 m-auto"> {/* Consider adjusting width */}
                            <div className="modal-content">
                                {/* Close Button */}
                                <button type="button" className="btn-close ms-auto mt-20 me-4" data-bs-dismiss="modal" aria-label="Close"><i className="fa-regular fa-xmark"></i></button>

                                {/* Modal Body with Filters */}
                                <div className="advance-search-panel p-40"> {/* Added padding */}
                                    <div className="main-bg border-0">
                                        {/* Use form tag, handle submit with apply button */}
                                        <form onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}>
                                            <div className="row gx-lg-5">
                                                {/* Keyword Input */}
                                                <div className="col-12">
                                                    <div className="input-box-one mb-35">
                                                        <div className="label">Keyword</div>
                                                        <input
                                                            type="text"
                                                            placeholder="Search by keyword (address, title...)"
                                                            className="type-input"
                                                            value={currentFilters.searchTerm || ''} // Controlled input
                                                            onChange={handleSearchChange} // Use prop handler
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bedroom/Bathroom (Optional in Modal) */}
                                                {handleBedroomChange && (
                                                    <div className="col-lg-6">
                                                        <div className="input-box-one mb-40">
                                                            <div className="label">Bedroom</div>
                                                            <NiceSelect
                                                                className="nice-select fw-normal"
                                                                options={[{ value: "0", text: "Any" }, { value: "1", text: "1+" }, { value: "2", text: "2+" }, { value: "3", text: "3+" }, { value: "4", text: "4+" }, { value: "5", text: "5" }]}
                                                                key={`modal-bed-${currentFilters.bedrooms}`}
                                                                defaultCurrent={["0", "1", "2", "3", "4", "5"].indexOf(currentFilters.bedrooms)}
                                                                onChange={handleBedroomChange}
                                                                name="modal_bedrooms"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {handleBathroomChange && (
                                                    <div className="col-lg-6">
                                                        <div className="input-box-one mb-40">
                                                            <div className="label">Bath</div>
                                                            <NiceSelect
                                                                className="nice-select fw-normal"
                                                                options={[{ value: "0", text: "Any" }, { value: "1", text: "1+" }, { value: "2", text: "2+" }, { value: "3", text: "3+" }, { value: "4", text: "4+" }]}
                                                                key={`modal-bath-${currentFilters.bathrooms}`}
                                                                defaultCurrent={["0", "1", "2", "3", "4"].indexOf(currentFilters.bathrooms)}
                                                                onChange={handleBathroomChange}
                                                                name="modal_bathrooms"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Amenities Checkboxes */}
                                                <div className="col-12">
                                                    <h6 className="block-title fw-bold mb-30">Amenities</h6>
                                                    <ul className="style-none d-flex flex-wrap justify-content-between filter-input">
                                                        {ammenities_data.map((list, i) => (
                                                            <li key={i}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="ModalAmenities" // Unique name if needed
                                                                    value={list}
                                                                    checked={currentFilters.amenities.includes(list)} // Use checked state from props
                                                                    onChange={handleAmenityChange} // Use prop handler
                                                                />
                                                                <label>{list}</label>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Price Range Slider */}
                                                <div className="col-md-6">
                                                    <h6 className="block-title fw-bold mt-45 mb-20">Price range</h6>
                                                    <div className="price-ranger">
                                                        <div className="price-input d-flex align-items-center justify-content-between pt-5">
                                                            {/* Display current numerical range from state */}
                                                            <div className="field d-flex align-items-center"><input type="number" readOnly className="input-min" value={currentFilters.priceRangeValues[0]} /></div>
                                                            <div className="divider-line"></div>
                                                            {/* Handle display for MAX_SAFE_INTEGER */}
                                                            <div className="field d-flex align-items-center">
                                                                <input type="number" readOnly className="input-max" value={currentFilters.priceRangeValues[1] === Number.MAX_SAFE_INTEGER ? maxPrice : currentFilters.priceRangeValues[1]} />
                                                                {currentFilters.priceRangeValues[1] === Number.MAX_SAFE_INTEGER ? '+' : ''}
                                                            </div>
                                                            <div className="currency ps-1">USD</div>
                                                        </div>
                                                    </div>
                                                    {/* Pass clamped values to PriceRange */}
                                                    <PriceRange
                                                        MAX={maxPrice} // Max from Redux state via props
                                                        MIN={0}
                                                        STEP={1000} // Adjust step if needed
                                                        values={sliderValues} // Use clamped values for handles
                                                        handleChanges={handlePriceChange} // Prop handler -> dispatches setPriceRangeValues
                                                    />
                                                </div>

                                                {/* SQFT Inputs */}
                                                <div className="col-md-6">
                                                    <h6 className="block-title fw-bold mt-45 mb-20">SQFT</h6>
                                                    <div className="d-flex align-items-center sqf-ranger">
                                                        <input
                                                            type="number"
                                                            placeholder="Min"
                                                            value={getSqftValue(0)} // Use helper for null
                                                            onChange={handleSqftMinChange} // Use prop handler
                                                            min="0"
                                                        />
                                                        <div className="divider"></div>
                                                        <input
                                                            type="number"
                                                            placeholder="Max"
                                                            value={getSqftValue(1)} // Use helper for null
                                                            onChange={handleSqftMaxChange} // Use prop handler
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="col-12">
                                                    {/* Apply Button */}
                                                    <button type="submit" className="fw-500 text-uppercase tran3s apply-search w-100 mt-40 mb-25">
                                                        <i className="fa-light fa-magnifying-glass"></i>
                                                        <span>Apply Filters</span>
                                                    </button>
                                                </div>
                                                <div className="col-12">
                                                    <div className="d-flex justify-content-between form-widget">
                                                        {/* Reset Button */}
                                                        <button type="button" onClick={handleModalReset} style={{ cursor: "pointer", background: 'none', border: 'none', padding: 0 }} className="tran3s">
                                                            <i className="fa-regular fa-arrows-rotate"></i>
                                                            <span>Reset Filter</span>
                                                        </button>
                                                        {/* Save Search (Implement Later) */}
                                                        {/* <Link to="#" className="tran3s"> */}
                                                        {/*    <i className="fa-regular fa-star"></i> */}
                                                        {/*    <span>Save Search</span> */}
                                                        {/* </Link> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDropdownModal;