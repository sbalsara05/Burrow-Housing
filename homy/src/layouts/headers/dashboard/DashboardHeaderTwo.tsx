// frontend/layouts/headers/dashboard/DashboardHeaderTwo.tsx
import React, { useState } from 'react'; // Import React
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux'; // Import useSelector
import Notification from "./Notification";
import Profile from "./Profile"; // This component will handle the dropdown logic
import DashboardHeaderOne from "./DashboardHeaderOne";
import { selectProfile } from '../../../redux/slices/profileSlice'; // Corrected import path
import { selectCurrentUser } from '../../../redux/slices/authSlice'; // Corrected import path

interface DashboardHeaderTwoProps {
    title: string;
}

const DashboardHeaderTwo: React.FC<DashboardHeaderTwoProps> = ({ title }) => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const profile = useSelector(selectProfile); // Get detailed profile from Redux
    // const currentUser = useSelector(selectCurrentUser); // Basic user info (optional fallback)

    // Determine avatar source: profile first, then default
    const getAvatarSrc = () => {
        // Construct the full URL for the profile image if the path is relative
        if (profile?.image) {
            // Assuming profile.image stores a relative path like 'uploads/filename.jpg'
            // Adjust the base URL as needed if your backend serves static files differently
            return `http://localhost:3000/${profile.image.replace(/\\/g, '/')}`; // Ensure forward slashes
        }
        // Fallback to default placeholder
        return "/assets/images/dashboard/no-profile-pic.png";
    };

    return (
        <>
            <header className="dashboard-header">
                <div className="d-flex align-items-center justify-content-end">
                    <h4 className="m0 d-none d-lg-block">{title}</h4>
                    {/* Mobile Nav Toggler */}
                    <button onClick={() => setIsActive(true)} className="dash-mobile-nav-toggler d-block d-md-none me-auto">
                        <span></span>
                    </button>

                    {/* Optional Search Form */}
                    {/* <form onSubmit={(e) => e.preventDefault()} className="search-form ms-auto"> ... </form> */}

                    {/* Notification Dropdown */}
                    <div className="profile-notification position-relative dropdown-center ms-auto ms-md-5 me-4"> {/* Adjusted margin */}
                        <button className="noti-btn dropdown-toggle" type="button" id="notification-dropdown" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                            <img src="/assets/images/dashboard/icon/icon_11.svg" alt="Notifications" className="lazy-img" />
                            <div className="badge-pill"></div> {/* Dynamic count later */}
                        </button>
                        <Notification />
                    </div>

                    {/* Add Listing Button */}
                    <div className="d-none d-md-block me-3">
                        <Link to="/dashboard/add-property" className="btn-two">
                            <span>Add Listing</span> <i className="fa-thin fa-arrow-up-right"></i>
                        </Link>
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="user-data position-relative">
                        <button className="user-avatar online position-relative rounded-circle dropdown-toggle" type="button" id="profile-dropdown" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                            {/* Use dynamic avatar source */}
                            <img src={getAvatarSrc()} alt="User Avatar" className="lazy-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                        <Profile /> {/* Profile component contains the dropdown menu */}
                    </div>
                </div>
            </header>
            {/* Mobile Sidebar */}
            <DashboardHeaderOne isActive={isActive} setIsActive={setIsActive} />
        </>
    );
};

export default DashboardHeaderTwo;