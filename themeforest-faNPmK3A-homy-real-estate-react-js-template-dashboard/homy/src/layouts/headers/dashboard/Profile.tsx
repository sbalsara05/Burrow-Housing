// frontend/layouts/headers/dashboard/Profile.tsx
import React from 'react'; // Import React
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import DeleteModal from "../../../modals/DeleteModal"; // Keep if using delete modal
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
        navigate('/home-three'); // Redirect to home/login page after logout
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
                            <img src="/assets/images/dashboard/icon/icon_settings.svg" alt="" className="lazy-img me-2" /> {/* Different icon */}
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
                            <img src="/assets/images/dashboard/icon/icon_logout.svg" alt="" className="lazy-img me-2" /> {/* Logout icon */}
                            <span>Logout</span>
                        </button>
                    </li>
                    {/* Delete Account Modal Trigger (Keep if needed) */}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <Link className="dropdown-item d-flex align-items-center text-danger" to="#" data-bs-toggle="modal" data-bs-target="#deleteModal">
                            <img src="/assets/images/dashboard/icon/icon_trash.svg" alt="" className="lazy-img me-2" /> {/* Delete icon */}
                            <span>Delete Account</span>
                        </Link>
                    </li>
                </ul>
            </div>
            {/* Delete Modal (Ensure it's rendered, maybe in a layout component) */}
            <DeleteModal />
        </>
    );
};

export default Profile;