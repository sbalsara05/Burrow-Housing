// frontend/components/ListingDetails/listing-details-common/CommonPropertyFeatureList.tsx
import React, { useState, useEffect } from 'react';
import { Property } from '../../../redux/slices/propertySlice'; // Adjust path

// Define props interface
interface CommonPropertyFeatureListProps {
    property: Property | null;
}

// Interface matching the structure of your *static* data used previously
// We'll map the dynamic 'property' data to this structure if needed, or use 'property' directly
interface FeatureGroup {
    id: number;
    title: string;
    feature_list: { title: string; count: string | number | undefined }[];
    showAnswer: boolean; // Keep for accordion state if using that pattern
}

const CommonPropertyFeatureList: React.FC<CommonPropertyFeatureListProps> = ({ property }) => {

    // Local state to manage accordion open/close status
    const [openSections, setOpenSections] = useState<number[]>([1]); // Default open section

    const handleAccordionClick = (index: number) => {
        setOpenSections(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    if (!property) return null; // Or placeholder

    // *** Map dynamic property data to the structure your component expects ***
    // This part needs careful adaptation based on where the data lives in 'property'
    const mappedFeatureData: FeatureGroup[] = [
        {
            id: 1,
            title: "Property Details",
            feature_list: [
                { title: "Size:", count: property.listingDetails.size ? `${property.listingDetails.size.toLocaleString()} sqft` : 'N/A' },
                { title: "Bedrooms:", count: property.listingDetails.bedrooms },
                { title: "Bathrooms:", count: property.listingDetails.bathrooms },
                { title: "Floor No:", count: property.listingDetails.floorNo },
                { title: "Lease Length:", count: property.leaseLength },
                { title: "Category:", count: property.overview.category },
                { title: "Room Type:", count: property.overview.roomType },
                // Add other relevant details, converting values to strings as needed
                // { title: "Year Built:", count: property.yearBuilt || 'N/A' },
                // { title: "Garage:", count: property.listingDetails.garage || 'No' },
            ],
            showAnswer: openSections.includes(1), // Connect to state
        },
        // Add more sections (e.g., "Utilities", "Building Info") if needed, mapping data similarly
        // {
        //     id: 2,
        //     title: "Building Information",
        //     feature_list: [
        //        { title: "Building Name:", count: property.buildingName || 'N/A'},
        //        // ... other building details ...
        //     ],
        //     showAnswer: openSections.includes(2),
        // },
    ];


    return (
        <div className="accordion" id="propertyFeaturesAccordion">
            {mappedFeatureData.map((item) => (
                <div key={item.id} className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            onClick={() => handleAccordionClick(item.id)}
                            className={`accordion-button ${!item.showAnswer ? "collapsed" : ""}`}
                            type="button"
                            aria-expanded={item.showAnswer}
                        >
                            {item.title}
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${item.showAnswer ? "show" : ""}`}>
                        <div className="accordion-body">
                            <div className="feature-list-two">
                                <ul className="style-none d-flex flex-wrap justify-content-between">
                                    {item.feature_list.map((list, i) => (
                                        <li key={i}>
                                            <span>{list.title} </span>
                                            <span className="fw-500 color-dark">{list.count ?? 'N/A'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommonPropertyFeatureList;