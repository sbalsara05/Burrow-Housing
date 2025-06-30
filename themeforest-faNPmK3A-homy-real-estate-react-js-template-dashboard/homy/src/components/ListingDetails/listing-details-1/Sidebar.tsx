
// frontend/components/ListingDetails/listing-details-1/Sidebar.tsx
import React from 'react';
// import FeatureListing from "../listing-details-sidebar/FeatureListing"; // Needs modification if dynamic
// import MortgageCalculator from "../listing-details-sidebar/MortgageCalculator"; // Needs modification
// import ScheduleForm from "../listing-details-sidebar/ScheduleForm"; // Needs modification
import SidebarInfo from "../listing-details-sidebar/SidebarInfo"; // Needs modification if agent is linked
import { Property } from '../../../redux/slices/propertySlice'; // Adjust path

interface SidebarProps {
    property: Property | null;
}

const Sidebar: React.FC<SidebarProps> = ({ property }) => {
    return (
        <div className="col-xl-4 col-lg-8 me-auto ms-auto">
            {/* Use Tailwind sticky positioning with proper prefix */}
            <div className="theme-sidebar-one dot-bg p-30 ms-xxl-3 lg-mt-80 tw-top-5 tw-z-10">
                {/* Agent Info (Pass agent data if available in property) */}
                <div className="agent-info bg-white border-20 p-30 mb-40">
                    {/* Assuming agent info is NOT directly on the property object */}
                    {/* You might fetch agent separately based on property.userId */}
                    <SidebarInfo agentId={property?.userId} /> {/* Example: Pass ID */}
                </div>
                {/* Schedule Tour Form */}
                {/*Will keep for now, can be used later for ambassador program*/}
                {/*<div className="tour-schedule bg-white border-20 p-30 mb-40">*/}
                {/*    <h5 className="mb-40">Schedule Tour</h5>*/}
                {/*    /!* Pass property title/ID if needed in the message *!/*/}
                {/*    <ScheduleForm propertyTitle={property?.title || 'this property'} propertyId={property?._id} />*/}
                {/*</div>*/}

                {/* Featured Listing (Modify to fetch relevant listings) */}
                {/*<FeatureListing currentPropertyId={property?._id} />*/}
            </div>
        </div>
    );
};

export default Sidebar;