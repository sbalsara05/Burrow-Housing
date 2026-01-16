// frontend/layouts/headers/dashboard/Profile.tsx
import React from 'react'; // Import React
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks

import { logoutUser, selectCurrentUser } from '../../../redux/slices/authSlice'; // Import logout action and selector
import { AppDispatch } from '../../../redux/slices/store.ts'; // Import AppDispatch

const Profile: React.FC = () => { // Use React.FC for type safety
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser); // Get current user info

    const handleLogout = async () => {
        // Show confirmation dialog? (Optional)
        // if (!window.confirm("Are you sure you want to logout?")) {
        //     return;
        // }
        await dispatch(logoutUser());
        navigate('/home'); // Redirect to home/login page after logout
    };

    return (
        <>
            {/* This div contains the dropdown menu logic provided by Bootstrap */}
            <div className="user-name-data"> {/* This class might be unnecessary */}
                <ul className="dropdown-menu" aria-labelledby="profile-dropdown">
                    {/* Display Username */}
                    {currentUser && (
                        <>
                            <li className="dropdown-header">
                                Signed in as <br /><strong>{currentUser.name}</strong>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                        </>
                    )}
                    {/* Profile Link */}
                    <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/dashboard/profile">
                            <img src="/assets/images/dashboard/icon/icon_23.svg" alt="" className="lazy-img me-2" />{/* Added me-2 */}
                            <span>Profile</span>
                        </Link>
                    </li>
                    {/* Account Settings Link */}
                    <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/dashboard/account-settings">
                            <img src="/assets/images/dashboard/icon/icon_4.svg" alt="" className="lazy-img me-2" /> {/* Different icon */}
                            <span>Account Settings</span>
                        </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    {/* Logout Button */}
                    <li>
                        <button
                            className="dropdown-item d-flex align-items-center logout-btn"
                            onClick={handleLogout}
                            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.25rem 1rem' }} // Basic button styling to mimic link
                        >
                            <div className="d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px', minWidth: '24px' }}>
                                <img src="/assets/images/dashboard/icon/icon_41.svg" alt="" className="logout-icon" style={{ filter: 'brightness(0)', transition: 'all 0.25s ease-in-out 0s' }} /> {/* Logout icon - black */}
                            </div>
                            <span>Logout</span>
                        </button>
                    </li>

                </ul>
            </div>

        </>
    );
};

export default Profile;