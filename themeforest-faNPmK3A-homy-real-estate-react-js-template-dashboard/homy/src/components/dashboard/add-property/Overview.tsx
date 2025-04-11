// frontend/components/dashboard/add-property/Overview.tsx
import React from 'react'; // Import React
import NiceSelect from "../../../ui/NiceSelect"; // Ensure correct path

// Define props interface
interface OverviewProps {
    overviewData?: { // Make optional to handle initial state
        category: string;
        roomType: string;
        neighborhood: string;
        rent: number;
    };
    handleInputChange: (field: string, value: any) => void; // Handler from parent
}

const Overview: React.FC<OverviewProps> = ({ overviewData = {} as any, handleInputChange }) => { // Provide default empty object

    // Options for dropdowns
    const categoryOptions = [
        { value: "", text: "Select Category" }, // Placeholder/Required
        { value: "Single Room", text: "Single Room" },
        { value: "Apartment", text: "Apartment" },
    ];
    const roomTypeOptions = [
        { value: "", text: "Select Room Type" }, // Placeholder/Required
        { value: "Shared Room", text: "Shared Room" },
        { value: "Single Room", text: "Single Room" },
    ];
    const neighborhoodOptions = [
        { value: "Any", text: "Any" },
        { value: "Allston", text: "Allston" },
        { value: "Back Bay", text: "Back Bay" },
        { value: "Beacon Hill", text: "Beacon Hill" },
        { value: "Brighton", text: "Brighton" },
        { value: "Charlestown", text: "Charlestown" },
        { value: "Chinatown", text: "Chinatown" },
        { value: "Dorchester", text: "Dorchester" },
        { value: "Fenway", text: "Fenway" },
        { value: "Hyde Park", text: "Hyde Park" },
        { value: "Jamaica Plain", text: "Jamaica Plain" },
        { value: "Mattapan", text: "Mattapan" },
        { value: "Mission Hill", text: "Mission Hill" },
        { value: "North End", text: "North End" },
        { value: "Roslindale", text: "Roslindale" },
        { value: "Roxbury", text: "Roxbury" },
        { value: "South Boston", text: "South Boston" },
        { value: "South End", text: "South End" },
        { value: "West End", text: "West End" },
        { value: "West Roxbury", text: "West Roxbury" },
        { value: "Wharf District", text: "Wharf District" }
    ];

    // Find default indices based on current data
    const categoryIndex = categoryOptions.findIndex(o => o.value === overviewData.category);
    const roomTypeIndex = roomTypeOptions.findIndex(o => o.value === overviewData.roomType);
    const neighborhoodIndex = neighborhoodOptions.findIndex(o => o.value === overviewData.neighborhood);

    return (
        <div className="bg-white card-box border-20">
            <h4 className="dash-title-three">Overview</h4>
            <div className="row align-items-end">
                {/* Category */}
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="overview-category">Category*</label>
                        <NiceSelect
                            className="nice-select"
                            options={categoryOptions}
                            key={`cat-${overviewData.category}`} // Add key
                            defaultCurrent={categoryIndex >= 0 ? categoryIndex : 0}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            name="category"
                            placeholder="Select Category" // Not used if defaultCurrent works
                        />
                    </div>
                </div>
                {/* Room Type */}
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="overview-roomType">Room Type*</label>
                        <NiceSelect
                            className="nice-select"
                            options={roomTypeOptions}
                            key={`room-${overviewData.roomType}`}
                            defaultCurrent={roomTypeIndex >= 0 ? roomTypeIndex : 0}
                            onChange={(e) => handleInputChange('roomType', e.target.value)}
                            name="roomType"
                        />
                    </div>
                </div>
                {/* Neighborhood */}
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="overview-neighborhood">Neighborhood*</label>
                        <NiceSelect
                            className="nice-select"
                            options={neighborhoodOptions}
                            key={`neigh-${overviewData.neighborhood}`} // Add key
                            defaultCurrent={neighborhoodIndex >= 0 ? neighborhoodIndex : 0}
                            onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                            name="neighborhood"
                        />
                    </div>
                </div>
                {/* Rent */}
                <div className="col-md-6">
                    <div className="dash-input-wrapper mb-30">
                        <label htmlFor="overview-rent">Total Rent ($/month)*</label>
                        <input
                            id="overview-rent"
                            type="number"
                            name="rent"
                            placeholder="e.g., 1500"
                            style={{ width: "100%" }}
                            value={overviewData.rent || ''} // Use value prop
                            onChange={(e) => handleInputChange('rent', e.target.value === '' ? '' : parseFloat(e.target.value))} // Parse to number
                            required
                            min="0" // Basic validation
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;