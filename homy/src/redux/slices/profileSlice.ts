// frontend/redux/slices/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './store.ts'; // Import RootState type

// --- Configuration ---
const API_URL = 'http://localhost:5001/api'; // Ensure this matches our backend URL

// --- Interfaces ---
// Define the shape of the Profile object based on your backend's profileModel.js
export interface Profile {
    _id?: string; // MongoDB ID, optional on creation
    userId: string; // Reference to the User ID
    username: string;
    school_email: string;
    majors_minors?: string;
    school_attending?: string;
    about?: string;
    image?: string | null; // Stores the *URL* of the image from S3
    createdAt?: string;
    // Add other fields from profileModel if needed
}

// Interface for profile data without image (for the update payload)
interface ProfileUpdateData {
    username: string;
    school_email: string;
    majors_minors?: string;
    school_attending?: string;
    about?: string;
    imageUrl?: string; // Will be set after image upload
}

// Interface for the update payload that includes optional image file
interface UpdateProfilePayload {
    profileData: Omit<ProfileUpdateData, 'imageUrl'>; // Profile data without image URL
    imageFile?: File; // Optional image file to upload
}

// Define the shape of the Profile state within Redux
interface ProfileState {
    profile: Profile | null;    // Holds the detailed profile data
    publicProfile: Profile | null;
    isLoading: boolean;         // Is a profile operation (fetch/update) in progress?
    isUpdatingProfile: boolean; // Specific loading state for profile updates
    isPublicProfileLoading: boolean;
    error: string | null;        // Stores error messages from profile API calls
    publicProfileError: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Detailed status
}

// --- Initial State ---
const initialState: ProfileState = {
    profile: null,
    publicProfile: null,
    isLoading: false,
    isUpdatingProfile: false,
    isPublicProfileLoading: false,
    error: null,
    publicProfileError: null,
    status: 'idle',
};

// --- Async Thunks (API Interactions) ---

// Thunk to Fetch the Detailed User Profile
export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile', // Action type prefix
    async (_, { getState, rejectWithValue }) => { // Use underscore if first arg (payload) is not needed
        const token = (getState() as RootState).auth.token; // Get token from auth state
        if (!token) {
            return rejectWithValue('User is not authenticated.'); // Cannot fetch without token
        }
        try {
            console.log("Dispatching fetchProfile");
            // Axios Authorization header should be set globally by authSlice helpers
            const response = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("fetchProfile fulfilled:", response.data);
            // The backend sends the profile object directly on success
            return response.data as Profile;
        } catch (error: any) {
            console.error("fetchProfile error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch detailed profile.');
        }
    }
);

//Thunk to Fetch a Public Profile by User ID
export const fetchPublicProfile = createAsyncThunk(
    'profile/fetchPublicProfile',
    async (userId: string, { rejectWithValue }) => {
        try {
            console.log(`[profileSlice] 1. Dispatching fetchPublicProfile for userId: ${userId}`);
            const response = await axios.get(`${API_URL}/profile/public/${userId}`);

            // *** ADD THIS LOG ***
            console.log("[profileSlice] 2. API Success. Data received from backend:", JSON.stringify(response.data, null, 2));
            // Let's explicitly check for the 'createdAt' field here.
            if (response.data.createdAt) {
                console.log(`[profileSlice] 2a. 'createdAt' field is PRESENT in API response: ${response.data.createdAt}`);
            } else {
                console.warn("[profileSlice] 2a. 'createdAt' field is MISSING from API response!");
            }

            return response.data as Profile;
        } catch (error: any) {
            console.error("[profileSlice] fetchPublicProfile error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile.');
        }
    }
);

// Thunk to Update Profile with Image Upload (Similar to Property Pattern)
export const updateProfileWithImage = createAsyncThunk(
    'profile/updateProfileWithImage',
    async ({ profileData, imageFile }: UpdateProfilePayload, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) {
            return rejectWithValue('Not authenticated. Please log in.');
        }

        try {
            let imageUrl: string | undefined;

            // Phase 1: Upload image if provided
            if (imageFile) {
                console.log("Phase 1: Uploading profile image...");

                // Get presigned URL for image upload
                const presignedUrlResponse = await axios.post(
                    `${API_URL}/upload-url`,
                    {
                        filename: imageFile.name,
                        contentType: imageFile.type
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const { signedUrl, publicUrl } = presignedUrlResponse.data;
                console.log("Phase 1: Received presigned URL");

                // Upload image directly to S3
                const uploadResponse = await fetch(signedUrl, {
                    method: 'PUT',
                    body: imageFile,
                    headers: {
                        'Content-Type': imageFile.type,
                        'x-amz-acl': 'public-read',
                    },
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Image upload failed with status ${uploadResponse.status}`);
                }

                imageUrl = publicUrl;
                console.log("Phase 1: Image uploaded successfully");
            }

            // Phase 2: Update profile with data (and image URL if uploaded)
            console.log("Phase 2: Updating profile data...");
            const finalProfileData: ProfileUpdateData = {
                ...profileData,
                ...(imageUrl && { imageUrl })
            };

            const response = await axios.put(
                `${API_URL}/profile`,
                finalProfileData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Phase 2: Profile updated successfully");
            return response.data.profile as Profile;

        } catch (error: any) {
            console.error("updateProfileWithImage error:", error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update profile. Please try again.'
            );
        }
    }
);

// Legacy thunk for backward compatibility (now uses the new pattern internally)
export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profileData: FormData, { dispatch, rejectWithValue }) => {
        try {
            // Extract image file from FormData if present
            const imageFile = profileData.get('image') as File | null;

            // Convert FormData to regular object for the new thunk
            const dataObject: Omit<ProfileUpdateData, 'imageUrl'> = {
                username: profileData.get('username') as string,
                school_email: profileData.get('school_email') as string,
                majors_minors: profileData.get('majors_minors') as string || undefined,
                school_attending: profileData.get('school_attending') as string || undefined,
                about: profileData.get('about') as string || undefined,
            };

            // Use the new thunk
            const result = await dispatch(updateProfileWithImage({
                profileData: dataObject,
                imageFile: imageFile || undefined
            }));

            if (updateProfileWithImage.fulfilled.match(result)) {
                return result.payload;
            } else {
                return rejectWithValue(result.payload);
            }
        } catch (error: any) {
            console.error("updateProfile (legacy) error:", error);
            return rejectWithValue('Failed to update profile.');
        }
    }
);

// --- Slice Definition ---
const profileSlice = createSlice({
    name: 'profile',
    initialState,
    // Synchronous reducers
    reducers: {
        clearProfileError: (state) => {
            state.error = null;
            state.publicProfileError = null;
        },
        // Action to clear profile data, e.g., on logout
        clearProfile: (state) => {
            console.log("Reducer: clearProfile");
            Object.assign(state, initialState);
        },
    },
    // Handle async thunk lifecycle actions
    extraReducers: (builder) => {
        builder
            // --- Fetch Profile ---
            .addCase(fetchProfile.pending, (state) => {
                console.log("Reducer: fetchProfile.pending");
                state.isLoading = true;
                state.status = 'loading';
                state.error = null; // Clear previous errors
            })
            .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
                console.log("Reducer: fetchProfile.fulfilled");
                state.isLoading = false;
                state.profile = action.payload; // Store the fetched profile data
                state.status = 'succeeded';
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                console.log("Reducer: fetchProfile.rejected", action.payload);
                state.isLoading = false;
                state.error = action.payload as string; // Store the error message
                state.status = 'failed';
                // state.profile = null; // Optionally clear profile on fetch error
            })

            // --- Fetch Public Profile ---
            .addCase(fetchPublicProfile.pending, (state) => {
                state.isPublicProfileLoading = true; state.publicProfileError = null; state.publicProfile = null;
            })
            .addCase(fetchPublicProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
                // *** ADD THIS LOG ***
                console.log("[profileSlice] 3. Reducer updating state with payload:", JSON.stringify(action.payload, null, 2));
                if (action.payload.createdAt) {
                    console.log(`[profileSlice] 3a. 'createdAt' is being set in Redux state: ${action.payload.createdAt}`);
                } else {
                    console.warn("[profileSlice] 3a. Payload for reducer is MISSING 'createdAt' field!");
                }

                state.isPublicProfileLoading = false; state.publicProfile = action.payload;
            })
            .addCase(fetchPublicProfile.rejected, (state, action) => {
                state.isPublicProfileLoading = false; state.publicProfileError = action.payload as string;
            })

            // --- Update Profile with Image ---
            .addCase(updateProfileWithImage.pending, (state) => {
                console.log("Reducer: updateProfileWithImage.pending");
                state.isUpdatingProfile = true;
                state.isLoading = true;
                state.status = 'loading';
                state.error = null; // Clear previous errors
            })
            .addCase(updateProfileWithImage.fulfilled, (state, action: PayloadAction<Profile>) => {
                console.log("Reducer: updateProfileWithImage.fulfilled");
                state.isUpdatingProfile = false;
                state.isLoading = false;
                state.profile = action.payload; // Update state with the updated profile from backend
                state.status = 'succeeded';
            })
            .addCase(updateProfileWithImage.rejected, (state, action) => {
                console.log("Reducer: updateProfileWithImage.rejected", action.payload);
                state.isUpdatingProfile = false;
                state.isLoading = false;
                state.error = action.payload as string; // Store the error message
                state.status = 'failed';
            })

            // --- Legacy Update Profile (for backward compatibility) ---
            .addCase(updateProfile.pending, (state) => {
                console.log("Reducer: updateProfile.pending (legacy)");
                state.isUpdatingProfile = true;
                state.isLoading = true;
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
                console.log("Reducer: updateProfile.fulfilled (legacy)");
                state.isUpdatingProfile = false;
                state.isLoading = false;
                state.profile = action.payload;
                state.status = 'succeeded';
            })
            .addCase(updateProfile.rejected, (state, action) => {
                console.log("Reducer: updateProfile.rejected (legacy)", action.payload);
                state.isUpdatingProfile = false;
                state.isLoading = false;
                state.error = action.payload as string;
                state.status = 'failed';
            });
    },
});

// --- Export Actions and Reducer ---
export const { clearProfileError, clearProfile } = profileSlice.actions;

// --- Selectors ---
export const selectProfileState = (state: RootState) => state.profile;
export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProfileLoading = (state: RootState) => state.profile.isLoading;
export const selectIsUpdatingProfile = (state: RootState) => state.profile.isUpdatingProfile;
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectProfileStatus = (state: RootState) => state.profile.status;
export const selectPublicProfile = (state: RootState) => state.profile.publicProfile;
export const selectIsPublicProfileLoading = (state: RootState) => state.profile.isPublicProfileLoading;
export const selectPublicProfileError = (state: RootState) => state.profile.publicProfileError;

export default profileSlice.reducer;