// frontend/layouts/headers/dashboard/DashboardHeaderOne.tsx
import React, { useState } from 'react'; // Import React
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useDispatch } from 'react-redux'; // Import useDispatch
import { AppDispatch } from '../../../redux/slices/store.ts'; // Import AppDispatch type
import { logoutUser } from '../../../redux/slices/authSlice'; // Import logoutUser action

interface DashboardHeaderOneProps {
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
}

// Use React.FC for component type safety
const DashboardHeaderOne: React.FC<DashboardHeaderOneProps> = ({ isActive, setIsActive }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [pathname, setPathname] = useState(window.location.pathname);

    // Function to handle navigation link clicks and close mobile menu
    const handleNavigation = (path: string) => {
        setPathname(path);
        // Check if setIsActive is a function before calling
        if (typeof setIsActive === 'function') {
            setIsActive(false);
        }
        // Navigate using react-router-dom
        navigate(path); // Use navigate for internal links
    };

    // Function to handle logout
    const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault(); // Prevent default link behavior
        console.log("Logout button clicked");
        try {
            await dispatch(logoutUser()).unwrap(); // Dispatch logout action and wait for completion (optional with unwrap)
            console.log("Logout dispatch completed, navigating...");
            navigate('/home-three'); // Redirect to home page after logout
            if (typeof setIsActive === 'function') {
                setIsActive(false); // Close sidebar if open on mobile
            }
        } catch (error) {
            console.error("Logout failed:", error);
            // Optionally show an error toast to the user
            // navigate('/home-three'); // Still navigate even if backend logout fails
        }
    };

    return (
        // Use aside tag for semantic sidebar
        <aside className={`dash-aside-navbar ${isActive ? "show" : ""}`}>
            <div className="position-relative">
                {/* Header: Logo and Close Button */}
                <div className="logo d-md-block d-flex align-items-center justify-content-between plr bottom-line pb-30">
                    <Link to="/home-three" onClick={() => handleNavigation('/home-three')}> {/* Use onClick for consistency */}
                        <img src="/assets/images/logo/textlogo.png" alt="Burrow Logo" style={{ marginLeft: 0, width: 200, height: "auto" }} />
                    </Link>
                    <button onClick={() => setIsActive(false)} className="close-btn d-block d-md-none"><i className="fa-light fa-circle-xmark"></i></button>
                </div>

                {/* Main Navigation */}
                <nav className="dasboard-main-nav pt-30 pb-30 bottom-line">
                    <ul className="style-none">
                        {/* Dashboard Link (Example - uncomment if needed) */}
                        {/*
                        <li className="plr">
                            <Link to="/dashboard/dashboard-index" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/dashboard-index' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/dashboard-index')}>
                                <img src={pathname === '/dashboard/dashboard-index' ? "/assets/images/dashboard/icon/icon_1_active.svg" : "/assets/images/dashboard/icon/icon_1.svg"} alt="" />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                         */}
                        {/* Message Link (Example - uncomment if needed) */}
                        {/*
                         <li className="plr">
                            <Link to="/dashboard/message" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/message' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/message')}>
                                <img src={pathname === '/dashboard/message' ? "/assets/images/dashboard/icon/icon_2_active.svg" : "/assets/images/dashboard/icon/icon_2.svg"} alt="" />
                                <span>Message</span>
                            </Link>
                        </li>
                         */}
                        {/* Divider (Example - uncomment if needed) */}
                        {/* <li className="bottom-line pt-30 lg-pt-20 mb-40 lg-mb-30"></li> */}

                        {/* Profile Section */}
                        <li><div className="nav-title">Profile</div></li>
                        <li className="plr">
                            <Link to="/dashboard/profile" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/profile' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/profile')}>
                                <img src={pathname === '/dashboard/profile' ? "/assets/images/dashboard/icon/icon_3_active.svg" : "/assets/images/dashboard/icon/icon_3.svg"} alt="" />
                                <span>Profile</span>
                            </Link>
                        </li>
                        <li className="plr">
                            <Link to="/dashboard/account-settings" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/account-settings' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/account-settings')}>
                                <img src={pathname === '/dashboard/account-settings' ? "/assets/images/dashboard/icon/icon_4_active.svg" : "/assets/images/dashboard/icon/icon_4.svg"} alt="" />
                                <span>Account Settings</span>
                            </Link>
                        </li>
                        {/* Membership Link (Example - uncomment if needed) */}
                        {/*
                         <li className="plr">
                             <Link to="/dashboard/membership" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/membership' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/membership')}>
                                 <img src={pathname === '/dashboard/membership' ? "/assets/images/dashboard/icon/icon_5_active.svg" : "/assets/images/dashboard/icon/icon_5.svg"} alt="" />
                                 <span>Membership</span>
                             </Link>
                         </li>
                        */}

                        {/* Listing Section */}
                        <li className="bottom-line pt-30 lg-pt-20 mb-40 lg-mb-30"></li>
                        <li><div className="nav-title">Listing</div></li>
                        <li className="plr">
                            <Link to="/dashboard/properties-list" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/properties-list' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/properties-list')}>
                                <img src={pathname === '/dashboard/properties-list' ? "/assets/images/dashboard/icon/icon_6_active.svg" : "/assets/images/dashboard/icon/icon_6.svg"} alt="" />
                                <span>My Properties</span>
                            </Link>
                        </li>
                        <li className="plr">
                            <Link to="/dashboard/add-property" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/add-property' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/add-property')}>
                                <img src={pathname === '/dashboard/add-property' ? "/assets/images/dashboard/icon/icon_7_active.svg" : "/assets/images/dashboard/icon/icon_7.svg"} alt="" />
                                <span>Add New Property</span>
                            </Link>
                        </li>
                        <li className="plr">
                            <Link to="/dashboard/favourites" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/favourites' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/favourites')}>
                                <img src={pathname === '/dashboard/favourites' ? "/assets/images/dashboard/icon/icon_8_active.svg" : "/assets/images/dashboard/icon/icon_8.svg"} alt="" />
                                <span>Favourites</span>
                            </Link>
                        </li>
                        <li className="plr">
                            <Link to="/dashboard/saved-search" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/saved-search' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/saved-search')}>
                                <img src={pathname === '/dashboard/saved-search' ? "/assets/images/dashboard/icon/icon_9_active.svg" : "/assets/images/dashboard/icon/icon_9.svg"} alt="" />
                                <span>Saved Search</span>
                            </Link>
                        </li>
                        {/* Reviews Link (Example - uncomment if needed) */}
                        {/*
                        <li className="plr">
                             <Link to="/dashboard/review" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/review' ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard/review')}>
                                 <img src={pathname === '/dashboard/review' ? "/assets/images/dashboard/icon/icon_10_active.svg" : "/assets/images/dashboard/icon/icon_10.svg"} alt="" />
                                 <span>Reviews</span>
                             </Link>
                         </li>
                         */}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="plr pt-30 pb-30"> {/* Adjusted padding */}
                    <Link
                        to="#" // Link destination is handled by onClick
                        className="d-flex w-100 align-items-center logout-btn"
                        onClick={handleLogout} // Use the logout handler
                    >
                        <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle">
                            <img src="/assets/images/dashboard/icon/icon_41.svg" alt="Logout Icon" />
                        </div>
                        <span>Logout</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default DashboardHeaderOne;