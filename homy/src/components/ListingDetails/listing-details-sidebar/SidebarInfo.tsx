import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck } from 'lucide-react';
import { Profile } from '../../../redux/slices/profileSlice';

// --- Define Props ---
interface SidebarInfoProps {
    profile: Profile | null;
    isLoading: boolean;
    onInterestedClick: () => void;
    interestStatus: string | null;
    isStatusLoading: boolean;
    isOwner: boolean;
}

// --- Skeleton Loader Component ---
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

const SidebarInfo: React.FC<SidebarInfoProps> = ({ profile, isLoading, onInterestedClick, interestStatus, isStatusLoading, isOwner }) => {
    const navigate = useNavigate();

    // --- RENDER LOGIC FOR THE MAIN ACTION BUTTON ---
    const renderActionButton = () => {
        if (isOwner) {
            return (
                <button
                    onClick={() => navigate('/dashboard/properties-list')}
                    className="btn flex-fill d-flex align-items-center justify-content-center text-white"
                    style={{ backgroundColor: '#2C3E50' }}
                >
                    Manage Property
                </button>
            );
        }

        if (isStatusLoading) {
            return <button className="btn flex-fill" disabled>Checking Status...</button>;
        }

        switch (interestStatus) {
            case 'pending':
                return <button className="btn flex-fill" disabled>Request Pending</button>;
            case 'approved':
                return <button onClick={() => navigate('/dashboard/chat')} className="btn flex-fill d-flex align-items-center justify-content-center text-white" style={{ backgroundColor: '#27ae60' }}>Go to Chat</button>;
            case 'declined':
                return <button className="btn flex-fill" disabled>Request Declined</button>;
            case 'withdrawn':
                return <button className="btn flex-fill" disabled>Request Withdrawn</button>;
            default: // null or any other case
                return (
                    <button
                        onClick={onInterestedClick}
                        className="btn flex-fill d-flex align-items-center justify-content-center text-white"
                        style={{ backgroundColor: '#f16040' }}
                    >
                        I'm Interested
                    </button>
                );
        }
    };

    if (isLoading) {
        return <SkeletonLoader />;
    }

    if (!profile) {
        return (
            <div className="agent-info bg-white border-20 p-30 mb-40 text-center">
                <p>Lister information is not available.</p>
            </div>
        );
    }

    const avatarUrl = profile.image || "/assets/images/dashboard/no-profile-pic.png";

    return (
        <div className="agent-info bg-white border-20 p-30 mb-40">
            <img
                src={avatarUrl}
                alt={`${profile.username}'s Avatar`}
                className="lazy-img rounded-circle ms-auto me-auto mt-3 avatar"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />

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

            <div className="d-flex justify-content-center gap-2">
                {renderActionButton()}
                <Link to="#" className="btn flex-fill d-flex align-items-center justify-content-center text-white" style={{ backgroundColor: '#f16040' }}>Request Ambassador</Link>
            </div>
        </div>
    );
};

export default SidebarInfo;