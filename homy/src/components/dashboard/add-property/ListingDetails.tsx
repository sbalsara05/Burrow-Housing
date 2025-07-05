import React from 'react';
import NumberNiceSelect from "../../../ui/NumberNiceSelect";

interface ListingDetailsData {
    size?: number | '';
    bedrooms: number;
    bathrooms: number;
    floorNo: number;
}

interface ListingDetailsProps {
    detailsData: ListingDetailsData;
    handleInputChange: (field: keyof ListingDetailsData, value: any) => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({
    detailsData,
    handleInputChange
}) => {

    const bedroomOptions = [{ value: 1, text: 1 }, { value: 2, text: 2 }, { value: 3, text: 3 }, { value: 4, text: 4 }, { value: 5, text: 5 }];
    const bathroomOptions = [{ value: 1, text: 1 }, { value: 2, text: 2 }, { value: 3, text: 3 }];
    const floorOptions = [{ value: 0, text: 0 }, { value: 1, text: 1 }, { value: 2, text: 2 }, { value: 3, text: 3 }, { value: 4, text: 4 }, { value: 5, text: 5 }];

    const bedIndex = bedroomOptions.findIndex(o => o.value === detailsData.bedrooms);
    const bathIndex = bathroomOptions.findIndex(o => o.value === detailsData.bathrooms);
    const floorIndex = floorOptions.findIndex(o => o.value === detailsData.floorNo);

    // 👇 This handler is now simpler, as it receives the value directly from the child component
    const handleNumberSelectChange = (field: keyof ListingDetailsData) => (value: number) => {
        handleInputChange(field, value);
    };

    return (
        <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Listing Details</h4>
            <div className="row align-items-end">
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="details-size">Size in sqft (Optional)</label>
                        <input
                            id="details-size"
                            type="number"
                            placeholder="e.g., 1200"
                            value={detailsData.size || ''}
                            onChange={(e) => handleInputChange('size', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            min="0"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="details-bedrooms">Bedrooms*</label>
                        <NumberNiceSelect
                            className="nice-select"
                            options={bedroomOptions}
                            defaultCurrent={bedIndex >= 0 ? bedIndex : 0}
                            onChange={handleNumberSelectChange('bedrooms')}
                            name="bedrooms"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="details-bathrooms">Bathrooms*</label>
                        <NumberNiceSelect
                            className="nice-select"
                            options={bathroomOptions}
                            defaultCurrent={bathIndex >= 0 ? bathIndex : 0}
                            onChange={handleNumberSelectChange('bathrooms')}
                            name="bathrooms"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="details-floorNo">Floor No.*</label>
                        <NumberNiceSelect
                            className="nice-select"
                            options={floorOptions}
                            defaultCurrent={floorIndex >= 0 ? floorIndex : 0}
                            onChange={handleNumberSelectChange('floorNo')}
                            name="floorNo"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetails;