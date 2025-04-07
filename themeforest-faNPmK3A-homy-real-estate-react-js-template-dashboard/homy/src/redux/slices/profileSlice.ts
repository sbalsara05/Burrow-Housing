// frontend/redux/slices/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store'; // Import RootState type

// --- Configuration ---
const API_URL = 'http://localhost:3000/api'; // Ensure this matches your backend URL

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
    image?: string | null; // Stores the *path* or *URL* of the image as a string
    // Add other fields from profileModel if needed
}

// Define the shape of the Profile state within Redux
interface ProfileState {
    profile: Profile | null;    // Holds the detailed profile data
    isLoading: boolean;         // Is a profile operation (fetch/update) in progress?
    error: string | null;        // Stores error messages from profile API calls
    status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Detailed status
}

// --- Initial State ---
const initialState: ProfileState = {
    profile: null,
    isLoading: false,
    error: null,
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
            // Axios Authorization header should be set globally by authSlice helpers
            const response = await axios.get(`${API_URL}/profile`);
            // The backend sends the profile object directly on success
            return response.data as Profile;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch detailed profile.');
        }
    }
);

// Thunk to Update the Detailed User Profile (Handles FormData)
export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profileData: FormData, { getState, rejectWithValue }) => { // Expect FormData as input
        const token = (getState() as RootState).auth.token;
        if (!token) {
            return rejectWithValue('User is not authenticated.');
        }
        try {
            // Axios Authorization header should be set globally
            const response = await axios.put(`${API_URL}/profile`, profileData, {
                headers: {
                    // No need to set Authorization header again if it's set globally
                    'Content-Type': 'multipart/form-data', // Crucial for file uploads with multer
                }
            });
            // Backend sends { message: '...', profile: {...} }
            return response.data.profile as Profile;
        } catch (error: any) {
            console.error("Redux Thunk - Update profile error details:", error.response?.data); // Log detailed error
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile.');
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
        },
        // Action to clear profile data, e.g., on logout
        clearProfile: (state) => {
            state.profile = null;
            state.status = 'idle';
            state.error = null;
            state.isLoading = false;
        },
    },
    // Handle async thunk lifecycle actions
    extraReducers: (builder) => {
        builder
            // --- Fetch Profile ---
            .addCase(fetchProfile.pending, (state) => {
                state.isLoading = true;
                state.status = 'loading';
                state.error = null; // Clear previous errors
            })
            .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
                state.isLoading = false;
                state.profile = action.payload; // Store the fetched profile data
                state.status = 'succeeded';
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string; // Store the error message
                state.status = 'failed';
                // state.profile = null; // Optionally clear profile on fetch error
            })

            // --- Update Profile ---
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true;
                state.status = 'loading';
                state.error = null; // Clear previous errors
            })
            .addCase(updateProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
                state.isLoading = false;
                state.profile = action.payload; // Update state with the updated profile from backend
                state.status = 'succeeded';
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string; // Store the error message
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
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectProfileStatus = (state: RootState) => state.profile.status;

export default profileSlice.reducer;