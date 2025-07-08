// frontend/components/ListingDetails/listing-details-1/Sidebar.tsx
import React from 'react';
import SidebarInfo from "../listing-details-sidebar/SidebarInfo";
import { Property } from '../../../redux/slices/propertySlice';

interface SidebarProps {
    property: Property | null;
    onInterestedClick?: () => void; // Add the onInterestedClick prop
}

const Sidebar: React.FC<SidebarProps> = ({ property, onInterestedClick }) => {
    return (
        <div className="col-xl-4 col-lg-8 me-auto ms-auto">
            {/* Use Tailwind sticky positioning with proper prefix */}
            <div className="theme-sidebar-one dot-bg p-30 ms-xxl-3 lg-mt-80 tw-top-5 tw-z-10">
                {/* Agent Info (Pass agent data if available in property) */}
                <div className="agent-info bg-white border-20 p-30 mb-40">
                    {/* Pass both agentId and onInterestedClick to SidebarInfo */}
                    <SidebarInfo
                        agentId={property?.userId}
                        onInterestedClick={onInterestedClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;