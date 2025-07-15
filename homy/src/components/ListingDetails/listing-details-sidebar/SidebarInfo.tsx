
// frontend/components/ListingDetails/listing-details-sidebar/SidebarInfo.tsx
import React from 'react';
import {Link} from "react-router-dom";
import {BadgeCheck} from 'lucide-react';

// Interface for the props
interface SidebarInfoProps {
    agentId?: string | null;
    onInterestedClick?: () => void; // Add the onInterestedClick prop
}

// Placeholder interface for fetched agent data
interface StudentData {
    name: string;
    majors?: string;
    school?: string;
    expectedGrad: string;
    responseTime: string;
    avatarUrl?: string;
    verified?: boolean;
}

const SidebarInfo: React.FC<SidebarInfoProps> = ({ agentId, onInterestedClick }) => {
    // Using static data directly until fetch is implemented
    const displayData = {
        name: "Sarah Johnson",
        majors: "Biochemistry Student",
        school: "Northeastern University",
        expectedGrad: "Spring 2026",
        responseTime: "< 1 hour",
        avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
        verified: true,
    };

    // Handle interested button click
    const handleInterestedClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default link behavior
        if (onInterestedClick) {
            onInterestedClick(); // Call the modal opening function
        }
    };

    return (
        <>
            <img
                src={displayData.avatarUrl || "/assets/images/dashboard/no-profile-pic.png"}
                alt={`${displayData.name || 'Agent'} Avatar`}
                className="lazy-img rounded-circle ms-auto me-auto mt-3 avatar"
                style={{width: '100px', height: '100px', objectFit: 'cover'}}
            />

            <div className="text-center mt-25">
                <div className="d-flex align-items-center justify-content-center">
                    <h6 className="name mb-0">{displayData.name || 'Student Name Unavailable'}</h6>
                    {displayData.verified && (
                        <BadgeCheck className="ms-1 text-primary" size={20} color="#1E88E5"/>
                    )}
                </div>
                <p className="fs-16">{displayData.majors || 'Student'}</p>
            </div>

            <div className="divider-line mt-40 mb-45 pt-20">
                <ul className="style-none">
                    {displayData.school && <li>School: <span>{displayData.school}</span></li>}
                    <li>Response Time: <span>{displayData.responseTime || "N/A"}</span></li>
                </ul>
            </div>

            <div className="mt-3" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px'
            }}>
                {/* Updated I'm Interested button to use modal instead of navigation */}
                <button
                    onClick={handleInterestedClick}
                    className="btn text-center text-white"
                    style={{
                        backgroundColor: '#f16040',
                        paddingTop: '15px',
                        paddingBottom: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e55a3c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f16040'}
                >
                    I'm Interested
                </button>

                <Link to="/request" className="btn text-center py-3 text-white"
                      style={{backgroundColor: '#f16040'}}>
                    Request Ambassador
                </Link>

                <Link to="#" className="btn text-center text-white"
                      style={{backgroundColor: '#f16040', paddingTop: '30px', paddingBottom: '8px'}}>
                    Save
                </Link>
            </div>
        </>
    );
};

export default SidebarInfo;