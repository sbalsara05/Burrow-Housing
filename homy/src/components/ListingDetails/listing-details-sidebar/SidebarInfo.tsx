import React from 'react';
import { Link } from "react-router-dom";
import { BadgeCheck } from 'lucide-react';
import { Profile } from '../../../redux/slices/profileSlice';

// --- Define Props ---
interface SidebarInfoProps {
    profile: Profile | null;
    isLoading: boolean;
    onInterestedClick: () => void; 
}

const SkeletonLoader = () => {
    return (
        <div className="agent-info bg-white border-20 p-30 mb-40 placeholder-glow">
            <div className="d-flex justify-content-center mb-3">
                <div className="placeholder rounded-circle" style={{ width: '100px', height: '100px' }}></div>
            </div>
            <div className="text-center">
                <h6 className="placeholder col-6"></h6>
                <p className="placeholder col-8"></p>
            </div>
            <div className="divider-line mt-40 mb-45 pt-20">
                <ul className="style-none">
                    <li><span className="placeholder col-10"></span></li>
                    <li><span className="placeholder col-8"></span></li>
                </ul>
            </div>
            <div className="d-flex justify-content-center gap-2">
                <div className="btn placeholder flex-fill" style={{ height: '50px' }}></div>
                <div className="btn placeholder flex-fill" style={{ height: '50px' }}></div>
                <div className="btn placeholder flex-fill" style={{ height: '50px' }}></div>
            </div>
        </div>
    );
};


const SidebarInfo: React.FC<SidebarInfoProps> = ({ profile, isLoading, onInterestedClick }) => {
    // ... (isLoading and !profile checks )
    if (isLoading) return <SkeletonLoader />;
    if (!profile) return (
        <div className="agent-info bg-white border-20 p-30 mb-40 text-center">
            <p>Lister information is not available.</p>
        </div>
    );

    // Handle interested button click
    const handleInterestedClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default link behavior
        if (onInterestedClick) {
            onInterestedClick(); // Call the modal opening function
        }
    };

    const avatarUrl = profile.image || "/assets/images/dashboard/no-profile-pic.png";

    return (
        <div className="agent-info bg-white border-20 p-30 mb-40">
            <img src={avatarUrl} alt={`${profile.username}'s Avatar`} className="lazy-img rounded-circle ms-auto me-auto mt-3 avatar" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
            <div className="text-center mt-25">
                <div className="d-flex align-items-center justify-content-center">
                    <h6 className="name mb-0">{profile.username}</h6>
                    <BadgeCheck className="ms-1 text-primary" size={20} color="#1E88E5" />
                </div>
                <p className="fs-16">{profile.majors_minors || 'Student'}</p>
            </div>
            <div className="divider-line mt-40 mb-45 pt-20">
                <ul className="style-none">
                    {profile.school_attending &&
                        <li className="d-flex justify-content-between">
                            <span>School:</span> <span className="fw-500 color-dark">{profile.school_attending}</span>
                        </li>
                    }
                    <li className="d-flex align-items-start justify-content-between">
                        <span className="me-2">About:</span>
                        <span className="fw-500 color-dark text-end">{profile.about || 'No information provided.'}</span>
                    </li>
                </ul>
            </div>

            <div className="mt-3" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px'
            }}>
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
                    style={{ backgroundColor: '#f16040' }}>
                    Request Ambassador
                </Link>

                <Link to="#" className="btn text-center text-white"
                    style={{ backgroundColor: '#f16040', paddingTop: '30px', paddingBottom: '8px' }}>
                    Save
                </Link>
            </div>
        </div>
    );
};

export default SidebarInfo;