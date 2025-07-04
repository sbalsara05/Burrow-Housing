import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"; // Keep Link if needed elsewhere
import UserAvatarSetting from "./UserAvatarSetting"; // Renders form fields
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from '../../../redux/slices/store.ts';
// Import actions and selectors from profileSlice
import { fetchProfile, updateProfile, selectProfile, selectProfileLoading, selectProfileError, clearProfileError, selectProfileStatus } from '../../../redux/slices/profileSlice';
// Import selector from authSlice for fallback if profile is null initially
import { selectCurrentUser } from "../../../redux/slices/authSlice";

const ProfileBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    // Select state from the profile slice
    const profile = useSelector(selectProfile);
    const isLoading = useSelector(selectProfileLoading);
    const error = useSelector(selectProfileError);
    const profileStatus = useSelector(selectProfileStatus);
    // Select basic user info as a fallback for initial display
    const currentUser = useSelector(selectCurrentUser);

    // --- Local State for Form ---
    const [formData, setFormData] = useState({
        username: "",
        school_email: "",
        majors_minors: "",
        school_attending: "",
        about: "",
        image: null as File | null, // For storing the selected File object
    });
    const [previewImage, setPreviewImage] = useState<string>("/assets/images/dashboard/no-profile-pic.png");
    // Store initial fetched data to enable cancel functionality
    const [initialDataForCancel, setInitialDataForCancel] = useState<any>(null);


    // --- Fetch Profile Data ---
    const loadProfile = useCallback(() => {
        // Only fetch if status is idle or failed, prevent re-fetching during loading/success
        if (profileStatus === 'idle' || profileStatus === 'failed') {
            console.log("ProfileBody: Dispatching fetchProfile...");
            dispatch(fetchProfile());
        }
        dispatch(clearProfileError()); // Clear previous errors on load attempt
    }, [dispatch, profileStatus]); // Depend on status

    useEffect(() => {
        loadProfile();
    }, [loadProfile]); // Fetch on mount and when loadProfile changes (rarely)


    // --- Populate Form When Profile Data Arrives ---
    useEffect(() => {
        if (profile) {
            console.log("ProfileBody: Populating form with fetched profile data:", profile);
            const profileFormData = {
                username: profile.username || '',
                school_email: profile.school_email || '',
                majors_minors: profile.majors_minors || '',
                school_attending: profile.school_attending || '',
                about: profile.about || '',
                image: null, // Reset local file state when profile data comes from Redux
            };
            setFormData(profileFormData);
            // Construct image URL based on stored path (adjust base URL if needed)
            const imageUrl = profile.image ? `http://localhost:3000/${profile.image.replace(/\\/g, '/')}` : "/assets/images/dashboard/no-profile-pic.png";
            setPreviewImage(imageUrl);
            // Store data for the 'Cancel' button functionality
            setInitialDataForCancel({ ...profileFormData, imagePath: profile.image });
        } else if (currentUser && !initialDataForCancel) {
            // Fallback using currentUser only if profile hasn't loaded yet and cancel data isn't set
            console.log("ProfileBody: Profile is null, using currentUser for initial fallback:", currentUser);
            const fallbackFormData = {
                username: currentUser.name || '',
                school_email: currentUser.email || '',
                majors_minors: '',
                school_attending: '',
                about: '',
                image: null,
            };
            setFormData(fallbackFormData);
            setInitialDataForCancel({ ...fallbackFormData, imagePath: null });
            setPreviewImage("/assets/images/dashboard/no-profile-pic.png");
        }
    }, [profile, currentUser]); // Depend on profile from Redux and currentUser


    // --- Form Input Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prevData) => ({
                ...prevData,
                image: file, // Store the actual File object
            }));
            setPreviewImage(URL.createObjectURL(file)); // Generate temporary preview URL
        }
    };

    const handleDeleteImage = () => {
        setPreviewImage("/assets/images/dashboard/no-profile-pic.png");
        setFormData({ ...formData, image: null }); // Clear local file state
        // To delete on the server, a flag or separate API call would be needed in handleSubmit
    };

    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(clearProfileError()); // Clear previous errors

        const formDataToSubmit = new FormData();

        // Append text fields from local state
        formDataToSubmit.append('username', formData.username);
        formDataToSubmit.append('school_email', formData.school_email);
        formDataToSubmit.append('majors_minors', formData.majors_minors || '');
        formDataToSubmit.append('school_attending', formData.school_attending || '');
        formDataToSubmit.append('about', formData.about || '');

        // Append the image *file* if it exists in local state
        if (formData.image instanceof File) {
            formDataToSubmit.append('image', formData.image);
            console.log("Appending image file to FormData:", formData.image.name);
        }
        // If formData.image is null (because user deleted it or never selected one),
        // the 'image' field won't be sent. The backend needs to handle this case
        // (e.g., don't update the image if the field is missing, or clear it if a specific flag is sent).

        console.log("Submitting Profile Update FormData:", Object.fromEntries(formDataToSubmit)); // Log FormData contents (image won't show full details)

        // Dispatch the updateProfile thunk with the FormData
        const resultAction = await dispatch(updateProfile(formDataToSubmit));

        if (updateProfile.fulfilled.match(resultAction)) {
            toast.success("Profile updated successfully!");
            // Update the 'initialDataForCancel' with the newly saved data
            const updatedProfile = resultAction.payload;
            setInitialDataForCancel({
                username: updatedProfile.username || '',
                school_email: updatedProfile.school_email || '',
                majors_minors: updatedProfile.majors_minors || '',
                school_attending: updatedProfile.school_attending || '',
                about: updatedProfile.about || '',
                imagePath: updatedProfile.image, // Store the new image path
            });
            setFormData(prev => ({ ...prev, image: null })); // Clear local file state after successful upload
        } else if (updateProfile.rejected.match(resultAction)) {
            toast.error(resultAction.payload as string || "Failed to update profile.");
        }
    };

    // --- Cancel Button Logic ---
    const handleCancel = () => {
        if (initialDataForCancel) {
            console.log("Cancelling, restoring initial data:", initialDataForCancel);
            setFormData({
                username: initialDataForCancel.username || '',
                school_email: initialDataForCancel.school_email || '',
                majors_minors: initialDataForCancel.majors_minors || '',
                school_attending: initialDataForCancel.school_attending || '',
                about: initialDataForCancel.about || '',
                image: null, // Always reset local file state on cancel
            });
            // Restore preview image from the stored path
            const imageUrl = initialDataForCancel.imagePath ? `http://localhost:3000/${initialDataForCancel.imagePath.replace(/\\/g, '/')}` : "/assets/images/dashboard/no-profile-pic.png";
            setPreviewImage(imageUrl);
        }
        dispatch(clearProfileError()); // Clear any errors shown
    };

    // --- Loading State ---
    if (profileStatus === 'loading' && !profile) { // Show loading only on initial fetch
        return <div className="dashboard-body"><p>Loading profile...</p></div>;
    }

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Profile" />
                <h2 className="main-title d-block d-lg-none">Profile</h2>

                <div className="bg-white card-box border-20">
                    {/* Display API error messages */}
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Image Upload Section */}
                        <div className="user-avatar-setting d-flex align-items-center mb-30">
                            <img src={previewImage} alt="Profile Preview" className="lazy-img user-img" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />
                            <div className="upload-btn position-relative tran3s ms-4 me-3">
                                Upload new photo
                                <input type="file" id="uploadImg" name="image" onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg" />
                            </div>
                            <button
                                type="button"
                                className="delete-btn tran3s"
                                onClick={handleDeleteImage}
                            >
                                Delete
                            </button>
                        </div>

                        {/* Form Fields Rendered by Sub-component */}
                        <UserAvatarSetting formData={formData} handleChange={handleChange} />

                        {/* Action Buttons */}
                        <div className="button-group d-inline-flex align-items-center mt-30">
                            <button type="submit" className="dash-btn-two tran3s me-3" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save"}
                            </button>
                            <button type="button" className="dash-cancel-btn tran3s" onClick={handleCancel} disabled={isLoading}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
                {/* AddressAndLocation and SocialMediaLink could be included here if part of the profile */}
            </div>
        </div>
    );
};

export default ProfileBody;