// frontend/components/dashboard/add-property/ListingDetails.tsx
import React from 'react'; // Import React
import NumberNiceSelect from "../../../ui/NumberNiceSelect"; // Ensure correct path

// Define the shape of the data slice this component receives
interface ListingDetailsData {
    size?: number;
    bedrooms: number;
    bathrooms: number;
    floorNo: number;
}

// Define the props interface
interface ListingDetailsProps {
    detailsData?: Partial<ListingDetailsData>; // Make optional for initial render
    handleInputChange: (field: keyof ListingDetailsData, value: any) => void; // Handler from parent
}


const ListingDetails: React.FC<ListingDetailsProps> = ({
    detailsData = { bedrooms: 1, bathrooms: 1, floorNo: 1 }, // Provide default empty object
    handleInputChange
}) => {

    // Options for dropdowns
    const bedroomOptions = [{ value: 1, text: 1 }, { value: 2, text: 2 }, { value: 3, text: 3 }, { value: 4, text: 4 }, { value: 5, text: 5 }];
    const bathroomOptions = [{ value: 1, text: 1 }, { value: 2, text: 2 }, { value: 3, text: 3 }];
    const floorOptions = [{ value: 0, text: 0 }, { value: 1, text: 1 }, { value: 2, text: 2 }, { value: 3, text: 3 }, { value: 4, text: 4 }, { value: 5, text: 5 }]; // Example floor numbers

    // Find default indices
    const bedIndex = bedroomOptions.findIndex(o => o.value === detailsData.bedrooms);
    const bathIndex = bathroomOptions.findIndex(o => o.value === detailsData.bathrooms);
    const floorIndex = floorOptions.findIndex(o => o.value === detailsData.floorNo);


    // Handler specifically for NumberNiceSelect as its onChange provides value directly
    const handleNumberSelectChange = (field: keyof ListingDetailsData) => (value: number) => {
        handleInputChange(field, value);
    };

    return (
        <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Listing Details</h4>
            <div className="row align-items-end">
                {/* Size */}
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="details-size">Size in sqft (Optional)</label>
                        <input
                            id="details-size"
                            type="number"
                            placeholder="e.g., 1200"
                            value={detailsData.size || ''} // Use value prop, default to empty string
                            onChange={(e) => handleInputChange('size', e.target.value === '' ? undefined : parseFloat(e.target.value))} // Parse to number or undefined
                            min="0"
                        />
                    </div>
                </div>
                {/* Bedrooms */}
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="details-bedrooms">Bedrooms*</label>
                        <NumberNiceSelect
                            className="nice-select"
                            options={bedroomOptions}
                            key={`bed-${detailsData.bedrooms}`} // Add key
                            defaultCurrent={bedIndex >= 0 ? bedIndex : 0}
                            onChange={handleNumberSelectChange('bedrooms')}
                            name="bedrooms"
                            placeholder="" // Not needed with defaultCurrent
                        />
                    </div>
                </div>
                {/* Bathrooms */}
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="details-bathrooms">Bathrooms*</label>
                        <NumberNiceSelect
                            className="nice-select"
                            options={bathroomOptions}
                            key={`bath-${detailsData.bathrooms}`} // Add key
                            defaultCurrent={bathIndex >= 0 ? bathIndex : 0}
                            onChange={handleNumberSelectChange('bathrooms')}
                            name="bathrooms"
                            placeholder=""
                        />
                    </div>
                </div>
                {/* Floor No. */}
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="details-floorNo">Floor No.*</label>
                        <NumberNiceSelect
                            className="nice-select"
                            options={floorOptions}
                            key={`floor-${detailsData.floorNo}`} // Add key
                            defaultCurrent={floorIndex >= 0 ? floorIndex : 0}
                            onChange={handleNumberSelectChange('floorNo')}
                            name="floorNo"
                            placeholder=""
                        />
                    </div>
                </div>
                {/* Removed Kitchens, Garages, Year Built as they aren't in the final model */}
            </div>
        </div>
    );
};

export default ListingDetails;