// frontend/components/ListingDetails/listing-details-common/CommonPropertyOverview.tsx
import React from 'react';
import { Property } from '../../../redux/slices/propertySlice'; // Adjust path if needed

interface CommonPropertyOverviewProps {
    property: Property | null;
}

const CommonPropertyOverview: React.FC<CommonPropertyOverviewProps> = ({ property }) => {

    if (!property) return null; // Or return placeholders

    // Prepare data points, handling optional fields
    const overviewData = [
        { id: 1, icon: "/assets/images/icon/squares-intersect.svg", title: `Sqft . ${property.listingDetails.size ? property.listingDetails.size.toLocaleString() : 'N/A'}` },
        { id: 2, icon: "/assets/images/icon/bed-double.svg", title: `Bed . ${property.listingDetails.bedrooms || 'N/A'}` },
        { id: 3, icon: "/assets/images/icon/bath.svg", title: `Bath . ${property.listingDetails.bathrooms || 'N/A'}` },
        { id: 4, icon: "/assets/images/icon/building.svg", title: `Type . ${property.overview.category || 'N/A'}` },
    ];

    return (
        <ul className="style-none d-flex flex-wrap align-items-center justify-content-between">
            {overviewData.map((item) => (
                <li key={item.id}>
                    <img src={item.icon} alt="" className="lazy-img icon " />
                    <span className="fs-20 color-dark">{item.title}</span>
                </li>
            ))}
        </ul>
    );
};

export default CommonPropertyOverview;