// frontend/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
// Import clearProfile from profileSlice to clear it on logout
import { clearProfile } from './profileSlice';

// --- Configuration ---
const API_URL = 'http://localhost:3000/api'; // Ensure this matches your backend URL

// --- Interfaces ---
// Define the shape of the User object based on your backend's /api/user response
export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isVerified: boolean;
    properties?: string[]; // Array of property IDs if included
}

// Define the shape of the Google user info if needed separately
interface GoogleUser {
    name: string;
    email: string;
    picture?: string;
}

// Define the shape of the Authentication state
interface AuthState {
    user: User | null;          // Holds basic user data after successful login/fetch
    googleUser: GoogleUser | null; // Optional: Store Google-specific info
    token: string | null;       // JWT token
    isAuthenticated: boolean;  // Is a valid token present and potentially verified by backend?
    isVerified: boolean;       // Is the logged-in user's email verified according to backend?
    isLoading: boolean;        // Is an auth operation in progress?
    isVerificationRequired: boolean; // Should the OTP form be shown?
    otpEmail: string | null;    // Which email needs OTP verification?
    error: string | null;       // Stores error messages from API calls
    status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Detailed status tracking
}

// --- Initial State ---
const getInitialState = (): AuthState => {
    const token = localStorage.getItem('token');
    // Set Axios default header if token exists on initial load
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log("Initial Load: Found token in localStorage, setting Axios header.");
    } else {
        // Ensure header is cleared if no token on load
        delete axios.defaults.headers.common['Authorization'];
        console.log("Initial Load: No token found in localStorage.");
    }
    return {
        user: null,
        googleUser: null,
        token: token,
        isAuthenticated: !!token, // True if token exists initially
        isVerified: false, // Needs confirmation from backend via fetchUserProfile
        isLoading: false,
        isVerificationRequired: false,
        otpEmail: null,
        error: null,
        status: 'idle', // Start as idle
    };
};

const initialState: AuthState = getInitialState();

// --- Helper Function for Token Management ---
const setAuthToken = (token: string | null) => {
    // Added detailed logging here based on user's debug request
    console.log(`setAuthToken called with: ${token ? 'TOKEN Present (starts ' + token.substring(0, 10) + '...)' : 'NULL'}`);
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log(`   -> Set localStorage and Axios header with token.`);
    } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        console.log(`   -> Removed token from localStorage and Axios header.`);
    }
};

// --- Async Thunks (API Interactions) ---

// Action: Register User
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: Omit<FormData, 'confirmPassword' | 'terms'>, { rejectWithValue }) => {
        console.log("Dispatching registerUser with:", userData.email);
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return { message: response.data.message, email: userData.email };
        } catch (error: any) {
            console.error("registerUser Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Registration failed.');
        }
    }
);

// Action: Login User
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: Pick<FormData, 'email' | 'password'>, { dispatch, rejectWithValue }) => {
        console.log("Dispatching loginUser for:", credentials.email);
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            const { token } = response.data;
            console.log("loginUser Fulfilled: Token received:", token.substring(0, 30) + '...');
            setAuthToken(token); // Store token and set header
            // Fetch user profile immediately after successful login
            console.log("loginUser Fulfilled: Dispatching fetchUserProfile...");
            // Important: Await the profile fetch if subsequent logic depends on it finishing
            await dispatch(fetchUserProfile());
            return { token }; // Return token to update state
        } catch (error: any) {
            console.error("loginUser Error:", error.response?.data || error.message);
            if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
                return rejectWithValue({
                    message: error.response.data.message,
                    requiresVerification: true,
                    email: credentials.email,
                });
            }
            return rejectWithValue(error.response?.data?.message || 'Login failed.');
        }
    }
);

// Action: Verify OTP
export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (otpData: { email: string; otp: string }, { dispatch, rejectWithValue }) => {
        console.log("Dispatching verifyOtp for:", otpData.email);
        try {
            const response = await axios.post(`${API_URL}/verify-otp`, otpData);
            const { token } = response.data;
            console.log("verifyOtp Fulfilled: Token received:", token.substring(0, 30) + '...');
            setAuthToken(token);
            console.log("verifyOtp Fulfilled: Dispatching fetchUserProfile...");
            await dispatch(fetchUserProfile());
            return { token };
        } catch (error: any) {
            console.error("verifyOtp Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Invalid or expired OTP.');
        }
    }
);

// Action: Resend OTP
export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (emailData: { email: string }, { rejectWithValue }) => {
        console.log("Dispatching resendOtp for:", emailData.email);
        try {
            const response = await axios.post(`${API_URL}/resend-otp`, emailData);
            return response.data;
        } catch (error: any) {
            console.error("resendOtp Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP.');
        }
    }
);

// Action: Fetch User Profile (using stored token)
export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (_, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        console.log(`fetchUserProfile Thunk: Attempting fetch. Token present: ${!!token}`);
        if (!token) {
            return rejectWithValue('No authentication token found.');
        }
        try {
            // Setting header again just before call for certainty during debugging
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log(`fetchUserProfile: Making GET to ${API_URL}/user with token (starts ${token.substring(0, 10)}...)`);
            const response = await axios.get(`${API_URL}/user`);
            console.log('fetchUserProfile: Success, User Data:', response.data);
            return response.data as User;
        } catch (error: any) {
            console.error(`fetchUserProfile: FAILED. Status: ${error.response?.status}, Data:`, error.response?.data);
            // --- Removed automatic token clearing on 401/403 error ---
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data.');
        }
    }
);

// Action: Update User (Name/Phone)
export const updateUser = createAsyncThunk(
    'auth/updateUser',
    async (userData: { name?: string; phone?: string }, { getState, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        if (!token) return rejectWithValue('Not authenticated');
        console.log("Dispatching updateUser with:", userData);
        try {
            const response = await axios.put(`${API_URL}/updateUser`, userData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.user as User;
        } catch (error: any) {
            console.error("updateUser Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Failed to update user details.');
        }
    }
);

// Action: Google Sign-In
export const googleSignIn = createAsyncThunk(
    'auth/googleSignIn',
    async (googleData: { access_token: string }, { dispatch, rejectWithValue }) => {
        console.log("Dispatching googleSignIn");
        try {
            const response = await axios.post(`${API_URL}/google`, googleData);
            const { token, user: googleUserInfo } = response.data;
            console.log("googleSignIn Fulfilled: Token received:", token.substring(0, 30) + '...');
            setAuthToken(token);
            console.log("googleSignIn Fulfilled: Dispatching fetchUserProfile...");
            await dispatch(fetchUserProfile());
            return { token, googleUser: googleUserInfo as GoogleUser };
        } catch (error: any) {
            console.error("googleSignIn Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Google Sign-In failed.');
        }
    }
);

// Action: Logout User
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { getState, dispatch, rejectWithValue }) => {
        const token = (getState() as RootState).auth.token;
        console.log(`Dispatching logoutUser. Token present: ${!!token}`);
        if (!token) {
            console.log("Logout: No token found, returning early.");
            return; // No server call needed if no token
        }
        try {
            // Attempt to blacklist token on backend
            await axios.post(`${API_URL}/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Logout: Backend logout successful (or ignored).");
        } catch (error: any) {
            // Log backend error but proceed with client-side logout
            console.warn("Logout: Backend logout failed (maybe token expired?):", error.response?.data?.message || error.message);
        } finally {
            // --- ALWAYS clear client-side token and state ---
            console.log("Logout: Clearing token and dispatching clearProfile.");
            setAuthToken(null);
            dispatch(clearProfile()); // Dispatch action from profileSlice
        }
        return true; // Indicate logout process completed for the reducer
    }
);

// --- Slice Definition ---
const authSlice = createSlice({
    name: 'auth',
    initialState,
    // Synchronous reducers
    reducers: {
        clearAuthError: (state) => {
            if (state.error) { // Only log if there was an error
                console.log("Reducer: clearAuthError called.");
            }
            state.error = null;
        },
        resetVerificationFlag: (state) => {
            if (state.isVerificationRequired || state.otpEmail) { // Only log if state changes
                console.log("Reducer: resetVerificationFlag called.");
            }
            state.isVerificationRequired = false;
            state.otpEmail = null;
        },
    },
    // Handle outcomes of async thunks
    extraReducers: (builder) => {
        builder
            // --- Register ---
            .addCase(registerUser.pending, (state) => {
                console.log("Reducer: registerUser.pending");
                state.isLoading = true; state.error = null; state.status = 'loading'; state.isVerificationRequired = false; state.otpEmail = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                console.log("Reducer: registerUser.fulfilled");
                state.isLoading = false; state.status = 'succeeded'; state.isVerificationRequired = true; state.otpEmail = action.payload.email;
            })
            .addCase(registerUser.rejected, (state, action) => {
                console.log("Reducer: registerUser.rejected", action.payload);
                state.isLoading = false; state.error = action.payload as string; state.status = 'failed';
            })

            // --- Login ---
            .addCase(loginUser.pending, (state) => {
                console.log("Reducer: loginUser.pending");
                state.isLoading = true; state.error = null; state.status = 'loading'; state.isVerificationRequired = false; state.otpEmail = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                console.log("Reducer: loginUser.fulfilled");
                state.isLoading = false; state.token = action.payload.token; state.isAuthenticated = true; state.isVerified = true; state.isVerificationRequired = false; state.error = null; state.status = 'succeeded'; state.otpEmail = null;
                // user state is set by fetchUserProfile reducer
            })
            .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
                console.log("Reducer: loginUser.rejected", action.payload);
                state.isLoading = false; state.status = 'failed'; state.token = null; state.isAuthenticated = false; state.user = null;
                if (action.payload?.requiresVerification) {
                    state.isVerificationRequired = true;
                    state.otpEmail = action.payload.email;
                    state.error = action.payload.message;
                } else {
                    state.error = action.payload as string;
                    state.isVerificationRequired = false;
                    state.otpEmail = null;
                }
            })

            // --- Verify OTP ---
            .addCase(verifyOtp.pending, (state) => {
                console.log("Reducer: verifyOtp.pending");
                state.isLoading = true; state.error = null; state.status = 'loading';
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                console.log("Reducer: verifyOtp.fulfilled");
                state.isLoading = false; state.token = action.payload.token; state.isAuthenticated = true; state.isVerified = true; state.isVerificationRequired = false; state.error = null; state.status = 'succeeded'; state.otpEmail = null;
                // user state is set by fetchUserProfile reducer
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                console.log("Reducer: verifyOtp.rejected", action.payload);
                state.isLoading = false; state.error = action.payload as string; state.status = 'failed';
            })

            // --- Resend OTP ---
            .addCase(resendOtp.pending, (state) => { console.log("Reducer: resendOtp.pending"); state.error = null; /* maybe isResendingOtp=true */ })
            .addCase(resendOtp.fulfilled, (state) => { console.log("Reducer: resendOtp.fulfilled"); /* maybe isResendingOtp=false */ })
            .addCase(resendOtp.rejected, (state, action) => { console.log("Reducer: resendOtp.rejected", action.payload); state.error = action.payload as string; /* maybe isResendingOtp=false */ })

            // --- Fetch User Profile ---
            .addCase(fetchUserProfile.pending, (state) => {
                console.log("Reducer: fetchUserProfile.pending");
                state.status = 'loading'; state.error = null; // Don't set global isLoading=true
            })
            .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
                console.log("Reducer: fetchUserProfile.fulfilled", action.payload);
                state.user = action.payload; state.isVerified = action.payload.isVerified; state.isAuthenticated = true; state.status = 'succeeded'; state.isLoading = false; state.error = null; // Clear error on success
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                console.log("Reducer: fetchUserProfile.rejected", action.payload);
                state.status = 'failed'; state.error = action.payload as string;
                // *** Crucially: Do NOT clear token or set isAuthenticated to false here ***
                // Let the failure be handled by subsequent actions or route guards if the token is truly invalid.
                // Only clear the user data if the fetch failed.
                state.user = null;
                state.isLoading = false;
                // If the error *definitively* means the token is invalid (e.g., specific error message),
                // then you *could* reset token/auth state here, but it's safer not to by default.
                // Example: if ((action.payload as string)?.includes("invalid token")) { ... reset ... }
            })

            // --- Update User ---
            .addCase(updateUser.pending, (state) => {
                console.log("Reducer: updateUser.pending");
                state.isLoading = true; state.status = 'loading'; state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
                console.log("Reducer: updateUser.fulfilled", action.payload);
                state.isLoading = false; state.user = action.payload; // Update user data
                state.status = 'succeeded';
            })
            .addCase(updateUser.rejected, (state, action) => {
                console.log("Reducer: updateUser.rejected", action.payload);
                state.isLoading = false; state.error = action.payload as string; state.status = 'failed';
            })

            // --- Google Sign In ---
            .addCase(googleSignIn.pending, (state) => {
                console.log("Reducer: googleSignIn.pending");
                state.isLoading = true; state.error = null; state.status = 'loading';
            })
            .addCase(googleSignIn.fulfilled, (state, action) => {
                console.log("Reducer: googleSignIn.fulfilled");
                state.isLoading = false; state.token = action.payload.token; state.googleUser = action.payload.googleUser; state.isAuthenticated = true; state.isVerified = true; state.isVerificationRequired = false; state.error = null; state.status = 'succeeded'; state.otpEmail = null;
                // user state is set by fetchUserProfile reducer
            })
            .addCase(googleSignIn.rejected, (state, action) => {
                console.log("Reducer: googleSignIn.rejected", action.payload);
                state.isLoading = false; state.error = action.payload as string; state.status = 'failed'; state.token = null; state.isAuthenticated = false; state.user = null; state.googleUser = null;
            })

            // --- Logout ---
            .addCase(logoutUser.pending, (state) => {
                console.log("Reducer: logoutUser.pending");
                state.isLoading = true; state.status = 'loading';
            })
            .addCase(logoutUser.fulfilled, (state) => {
                console.log("Reducer: logoutUser.fulfilled - Resetting state");
                // Reset state completely on successful logout (including clearing token done in thunk)
                Object.assign(state, initialState, { token: null, isAuthenticated: false, status: 'idle' });
            })
            .addCase(logoutUser.rejected, (state, action) => {
                // Still reset client state even if backend fails
                console.warn("Reducer: logoutUser.rejected - Resetting state despite backend error:", action.payload);
                Object.assign(state, initialState, { token: null, isAuthenticated: false, status: 'idle' });
                // state.error = action.payload as string; // Optionally store the backend logout error
            });
    },
});

// --- Export Actions and Reducer ---
export const { clearAuthError, resetVerificationFlag } = authSlice.actions;

// --- Selectors ---
export const selectAuthState = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsVerified = (state: RootState) => state.auth.isVerified;
export const selectIsVerificationRequired = (state: RootState) => state.auth.isVerificationRequired;
export const selectOtpEmail = (state: RootState) => state.auth.otpEmail;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;