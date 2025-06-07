import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
// Use actions/selectors from authSlice for basic user details
import { fetchUserProfile, updateUser, selectCurrentUser, selectAuthLoading, selectAuthError, clearAuthError, selectAuthStatus } from '../../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../../redux/slices/store.ts';

const AccountSettingBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    // Select state from the auth slice
    const currentUser = useSelector(selectCurrentUser);
    const isLoading = useSelector(selectAuthLoading); // Use auth loading state
    const error = useSelector(selectAuthError);     // Use auth error state
    const authStatus = useSelector(selectAuthStatus);

    // Local state for the form fields managed by this component
    const [userData, setUserData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });
    // Store original data fetched from Redux for the cancel button
    const [originalData, setOriginalData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // Fetch user data if not already present or if auth status isn't succeeded
    const loadUser = useCallback(() => {
        if (!currentUser && (authStatus === 'idle' || authStatus === 'failed')) {
            console.log("AccountSettingBody: Dispatching fetchUserProfile...");
            dispatch(fetchUserProfile());
        }
        dispatch(clearAuthError()); // Clear previous errors on load attempt
    }, [dispatch, currentUser, authStatus]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Effect to populate form when currentUser data loads/changes from Redux
    useEffect(() => {
        if (currentUser) {
            console.log("AccountSettingBody: Populating form with currentUser data:", currentUser);
            const nameParts = currentUser.name ? currentUser.name.split(" ") : ["", ""];
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";
            const currentFormData = {
                firstName: firstName,
                lastName: lastName,
                email: currentUser.email || "",
                phone: currentUser.phone || "",
            };
            setUserData(currentFormData);
            setOriginalData(currentFormData); // Store initial data for cancel
        }
    }, [currentUser]); // Rerun when currentUser changes

    // Handle changes in form inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle saving updated data
    const handleSave = async () => {
        dispatch(clearAuthError()); // Clear previous errors
        const nameToUpdate = `${userData.firstName} ${userData.lastName}`.trim();
        const phoneToUpdate = userData.phone;

        // Check if anything actually changed
        const nameChanged = nameToUpdate !== `${originalData.firstName} ${originalData.lastName}`.trim();
        const phoneChanged = phoneToUpdate !== originalData.phone;

        if (!nameChanged && !phoneChanged) {
            toast.info("No changes detected.");
            return; // Don't dispatch if nothing changed
        }

        // Prepare payload with only changed fields (optional, but good practice)
        const updatePayload: { name?: string; phone?: string } = {};
        if (nameChanged) updatePayload.name = nameToUpdate;
        if (phoneChanged) updatePayload.phone = phoneToUpdate;

        console.log("AccountSettingBody: Dispatching updateUser with payload:", updatePayload);
        const resultAction = await dispatch(updateUser(updatePayload));

        if (updateUser.fulfilled.match(resultAction)) {
            toast.success("Account details updated successfully");
            // Update originalData state AFTER successful save
            // Note: resultAction.payload contains the updated user from the backend
            const updatedUser = resultAction.payload;
            const nameParts = updatedUser.name ? updatedUser.name.split(" ") : ["", ""];
            setOriginalData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(" ") || '',
                email: updatedUser.email || '', // Email shouldn't change, keep consistent
                phone: updatedUser.phone || '',
            });
        } else if (updateUser.rejected.match(resultAction)) {
            toast.error(resultAction.payload as string || "Failed to update account details.");
        }
    };

    // Handle cancelling changes
    const handleCancel = () => {
        console.log("AccountSettingBody: Cancel clicked, restoring original data:", originalData);
        // Reset local form state to the stored original data
        setUserData({ ...originalData });
        dispatch(clearAuthError()); // Clear any displayed errors
    };

    // --- Loading State ---
    // Show loading if auth state is loading and we don't have user data yet
    if (isLoading && !currentUser && authStatus === 'loading') {
        return <div className="dashboard-body"><p>Loading user data...</p></div>;
    }

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Account Settings" />
                <h2 className="main-title d-block d-lg-none">Account Settings</h2>
                <div className="bg-white card-box border-20">
                    <h4 className="dash-title-three">Edit & Update</h4>

                    {/* Display API error messages from authSlice */}
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}

                    <form onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="dash-input-wrapper mb-20">
                                    <label htmlFor="firstName">First Name*</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Enter first name"
                                        value={userData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="dash-input-wrapper mb-20">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Enter last name"
                                        value={userData.lastName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="dash-input-wrapper mb-20">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="user@example.com"
                                        value={userData.email}
                                        readOnly // Email is read-only
                                        disabled // Visually disable
                                    />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="dash-input-wrapper mb-20">
                                    <label htmlFor="phone">Phone Number*</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="+1 (XXX) XXX-XXXX"
                                        value={userData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="dash-input-wrapper mb-20">
                                    <div className="info-text d-sm-flex align-items-center justify-content-between mt-5">
                                        <p className="m0">
                                            Want to change the password?{" "}
                                            <Link to="/dashboard/account-settings/password-change">
                                                Click here
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="button-group d-inline-flex align-items-center mt-30">
                            <button
                                type="button" // Important: Set type to prevent form submission
                                className="dash-btn-two tran3s me-3"
                                onClick={handleSave}
                                disabled={isLoading} // Disable during loading
                            >
                                {isLoading ? "Saving..." : "Save"}
                            </button>
                            <button
                                type="button"
                                className="dash-cancel-btn tran3s"
                                onClick={handleCancel}
                                disabled={isLoading} // Disable during loading
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingBody;