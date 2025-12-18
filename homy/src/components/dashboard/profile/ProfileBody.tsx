import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserAvatarSetting from "./UserAvatarSetting"; // Renders form fields
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import { toast } from "react-toastify";
import { AppDispatch } from '../../../redux/slices/store.ts';
// Import actions and selectors from profileSlice
import { 
    fetchProfile, 
    updateProfileWithImage, 
    selectProfile, 
    selectProfileLoading, 
    selectIsUpdatingProfile,
    selectProfileError, 
    clearProfileError, 
    selectProfileStatus 
} from '../../../redux/slices/profileSlice';
// Import selector from authSlice for fallback if profile is null initially
import { selectCurrentUser } from "../../../redux/slices/authSlice";

const ProfileBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    // Select state from the profile slice
    const profile = useSelector(selectProfile);
    const isLoading = useSelector(selectProfileLoading);
    const isUpdating = useSelector(selectIsUpdatingProfile);
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
        expected_graduation_year: "",
        about: "",
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>("/assets/images/dashboard/no-profile-pic.png");
    // Store initial fetched data to enable cancel functionality
    const [initialDataForCancel, setInitialDataForCancel] = useState<any>(null);
    // Track if we just completed an update to prevent useEffect from overwriting
    const [justUpdated, setJustUpdated] = useState(false);

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
        // Don't overwrite formData if we just completed an update (let the handleSubmit handle it)
        if (justUpdated) {
            console.log("Skipping useEffect because justUpdated is true");
            // Reset the flag after a short delay to allow formData to be set first
            setTimeout(() => setJustUpdated(false), 100);
            return;
        }
        
        if (profile) {
            console.log("ProfileBody: Populating form with fetched profile data:", profile);
            console.log("ProfileBody: expected_graduation_year from profile:", profile.expected_graduation_year, "type:", typeof profile.expected_graduation_year);
            // Explicitly check for these fields - preserve the actual value, even if it's an empty string
            const profileFormData = {
                username: profile.username || '',
                school_email: profile.school_email || '',
                majors_minors: profile.majors_minors || '',
                school_attending: profile.school_attending || '',
                expected_graduation_year: (profile.expected_graduation_year !== undefined && profile.expected_graduation_year !== null) ? String(profile.expected_graduation_year) : '',
                about: profile.about || '',
            };
            console.log("Profile form data after processing:", profileFormData);
            console.log("Profile form data - expected_graduation_year value:", profileFormData.expected_graduation_year);
            setFormData(profileFormData);
            
            // Set preview image from S3 URL or default
            const imageUrl = profile.image || "/assets/images/dashboard/no-profile-pic.png";
            setPreviewImage(imageUrl);
            
            // Store data for the 'Cancel' button functionality
            setInitialDataForCancel({ ...profileFormData, imagePath: profile.image });
            
            // Clear any selected file when profile loads
            setSelectedImage(null);
        } else if (currentUser && !initialDataForCancel) {
            // Fallback using currentUser only if profile hasn't loaded yet and cancel data isn't set
            console.log("ProfileBody: Profile is null, using currentUser for initial fallback:", currentUser);
            const fallbackFormData = {
                username: currentUser.name || '',
                school_email: currentUser.email || '',
                majors_minors: '',
                school_attending: '',
                expected_graduation_year: '',
                about: '',
            };
            setFormData(fallbackFormData);
            setInitialDataForCancel({ ...fallbackFormData, imagePath: null });
            setPreviewImage("/assets/images/dashboard/no-profile-pic.png");
        }
    }, [profile, currentUser, justUpdated]); // Depend on profile from Redux and currentUser

    // --- Form Input Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        console.log(`Form field changed: ${name} = "${value}"`);
        setFormData((prevData) => {
            const newData = {
                ...prevData,
                [name]: value,
            };
            console.log("Updated formData:", newData);
            return newData;
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type.toLowerCase())) {
                toast.error('Only JPEG, PNG, and WebP images are allowed.');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast.error('Image size should be less than 5MB.');
                return;
            }

            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file)); // Generate temporary preview URL
            console.log("Selected image file:", file.name, "Size:", file.size);
        }
    };

    const handleDeleteImage = () => {
        setPreviewImage("/assets/images/dashboard/no-profile-pic.png");
        setSelectedImage(null);
        
        // Clear the file input
        const fileInput = document.getElementById('uploadImg') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(clearProfileError()); // Clear previous errors

        // Validate required fields
        if (!formData.username || !formData.school_email) {
            toast.error('Username and school email are required.');
            return;
        }

        console.log("Submitting Profile Update with new pattern...");
        console.log("Form data:", formData);
        console.log("Selected image:", selectedImage?.name);

        // Ensure all fields are explicitly included, even if empty strings
        const profileDataToSend = {
            username: formData.username || '',
            school_email: formData.school_email || '',
            majors_minors: formData.majors_minors || '',
            school_attending: formData.school_attending || '',
            expected_graduation_year: formData.expected_graduation_year !== undefined ? formData.expected_graduation_year : '',
            about: formData.about || '',
        };
        
        console.log("Profile data being sent to backend:", profileDataToSend);
        console.log("Raw formData.expected_graduation_year before send:", formData.expected_graduation_year);

        try {
            // Use the new updateProfileWithImage thunk
            const resultAction = await dispatch(updateProfileWithImage({
                profileData: profileDataToSend,
                imageFile: selectedImage || undefined
            }));

            if (updateProfileWithImage.fulfilled.match(resultAction)) {
                toast.success("Profile updated successfully!");
                
                // Set flag FIRST to prevent useEffect from overwriting when Redux state updates
                setJustUpdated(true);
                
                // Update the 'initialDataForCancel' with the newly saved data
                const updatedProfile = resultAction.payload;
                console.log("Updated profile from backend:", updatedProfile);
                console.log("Updated profile - expected_graduation_year:", updatedProfile.expected_graduation_year, "type:", typeof updatedProfile.expected_graduation_year);
                
                const updatedFormData = {
                    username: updatedProfile.username || '',
                    school_email: updatedProfile.school_email || '',
                    majors_minors: updatedProfile.majors_minors || '',
                    school_attending: updatedProfile.school_attending || '',
                    expected_graduation_year: (updatedProfile.expected_graduation_year !== undefined && updatedProfile.expected_graduation_year !== null) ? String(updatedProfile.expected_graduation_year) : '',
                    about: updatedProfile.about || '',
                };
                
                console.log("Updated form data to set:", updatedFormData);
                console.log("Updated form data - expected_graduation_year value:", updatedFormData.expected_graduation_year);
                
                // Update formData state immediately with the saved values
                // Use a function to ensure we're setting the latest state
                setFormData(prev => {
                    console.log("Setting formData from:", prev, "to:", updatedFormData);
                    return updatedFormData;
                });
                
                setInitialDataForCancel({
                    ...updatedFormData,
                    imagePath: updatedProfile.image, // Store the new S3 image URL
                });
                
                // Reset justUpdated flag after a delay to allow formData to update
                setTimeout(() => {
                    console.log("Resetting justUpdated flag");
                    setJustUpdated(false);
                }, 200);
                
                // Clear selected image after successful upload
                setSelectedImage(null);
                
                // Clear the file input
                const fileInput = document.getElementById('uploadImg') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
                
                // Update preview to show the new uploaded image
                if (updatedProfile.image) {
                    setPreviewImage(updatedProfile.image);
                }
                
            } else if (updateProfileWithImage.rejected.match(resultAction)) {
                const errorMessage = resultAction.payload as string || "Failed to update profile.";
                toast.error(errorMessage);
                console.error("Profile update failed:", errorMessage);
            }
        } catch (error) {
            console.error("Unexpected error during profile update:", error);
            toast.error("An unexpected error occurred. Please try again.");
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
                expected_graduation_year: initialDataForCancel.expected_graduation_year || '',
                about: initialDataForCancel.about || '',
            });
            
            // Restore preview image from the stored path
            const imageUrl = initialDataForCancel.imagePath || "/assets/images/dashboard/no-profile-pic.png";
            setPreviewImage(imageUrl);
            
            // Clear selected file and file input
            setSelectedImage(null);
            const fileInput = document.getElementById('uploadImg') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        }
        dispatch(clearProfileError()); // Clear any errors shown
    };

    // --- Loading State ---
    if (profileStatus === 'loading' && !profile) { // Show loading only on initial fetch
        return (
            <div className="dashboard-body">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading profile...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Profile" />
                <h2 className="main-title d-block d-lg-none">Profile</h2>

                <div className="bg-white card-box border-20">
                    {/* Display API error messages */}
                    {error && (
                        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                            <span>{error}</span>
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => dispatch(clearProfileError())}
                                aria-label="Close"
                            ></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Top row: photo on left, Full Name/Current Year/Major on right */}
                        <div className="row align-items-start mb-20">
                            {/* Left: Photo */}
                            <div className="col-md-4 d-flex flex-column align-items-center">
                                <div className="position-relative mb-3">
                                    <img
                                        src={previewImage}
                                        alt="Profile Preview"
                                        className="lazy-img user-img"
                                        style={{
                                            width: '280px',
                                            height: '280px',
                                            objectFit: 'cover',
                                            borderRadius: '16px',
                                            border: selectedImage ? '3px solid #ff6b35' : '1px solid #ddd',
                                        }}
                                    />
                                    {selectedImage && (
                                        <div
                                            className="position-absolute top-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '28px', height: '28px', fontSize: '14px' }}
                                            title="New image selected"
                                        >
                                            ✓
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex flex-row align-items-center justify-content-center w-100" style={{ gap: '20px' }}>
                                    <div 
                                        className="upload-btn position-relative tran3s"
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            color: '#FF6725',
                                        }}
                                    >
                                        {selectedImage ? 'Change Photo' : 'Upload Photo'}
                                        <input
                                            type="file"
                                            id="uploadImg"
                                            name="image"
                                            onChange={handleImageChange}
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            disabled={isUpdating}
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                opacity: 0,
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="delete-btn tran3s"
                                        onClick={handleDeleteImage}
                                        disabled={isUpdating}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            color: '#FF6725',
                                        }}
                                    >
                                        {selectedImage ? 'Remove Selected' : 'Remove Photo'}
                                    </button>

                                    {selectedImage && (
                                        <div className="alert alert-info mt-3 w-100 text-center" style={{ maxWidth: 260 }}>
                                            <small>
                                                Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Full Name, Major (stacked) */}
                            <div className="col-md-8">
                                <div className="dash-input-wrapper mb-30">
                                    <label>Full Name*</label>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Enter your full name"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="dash-input-wrapper mb-30">
                                    <label>Major*</label>
                                    <input
                                        type="text"
                                        name="majors_minors"
                                        placeholder="Enter your major"
                                        value={formData.majors_minors}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="dash-input-wrapper mb-30">
                                    <label>Expected Graduation</label>
                                    <input
                                        type="text"
                                        name="expected_graduation_year"
                                        placeholder="e.g., 2026"
                                        value={formData.expected_graduation_year}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Full-width fields below: Graduation Year + University Email, then University, then About */}
                        <UserAvatarSetting formData={formData} handleChange={handleChange} />

                        {/* Action Buttons */}
                        <div className="button-group d-inline-flex align-items-center mt-30">
                            <button 
                                type="submit" 
                                className="dash-btn-two tran3s me-3" 
                                disabled={isLoading || isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {selectedImage ? 'Uploading...' : 'Saving...'}
                                    </>
                                ) : 'Save'}
                            </button>
                            <button 
                                type="button" 
                                className="dash-cancel-btn tran3s" 
                                onClick={handleCancel} 
                                disabled={isLoading || isUpdating}
                            >
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