// src/utils/authUtils.ts
export const authUtils = {
    // Check if token is valid
    isTokenValid: (): boolean => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            // Basic token validation - you might want to decode JWT and check expiry
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) return false;

            // Decode payload to check expiry (if your token has exp field)
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            // Check if token is expired
            if (payload.exp && payload.exp < currentTime) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    },

    // Clear authentication data
    clearAuth: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear any other auth-related data
    },

    // Redirect to login
    redirectToLogin: (): void => {
        authUtils.clearAuth();
        window.location.href = '/login'; // Adjust path as needed
    },

    // Handle auth errors in API responses
    handleAuthError: (error: any): boolean => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('Authentication error detected, redirecting to login');
            authUtils.redirectToLogin();
            return true;
        }
        return false;
    },

    // Enhanced fetch with auth error handling
    fetchWithAuth: async (url: string, options: RequestInit = {}): Promise<Response> => {
        const token = localStorage.getItem('token');

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            // Handle auth errors
            if (response.status === 401 || response.status === 403) {
                console.warn('Auth error in API call, clearing token');
                authUtils.clearAuth();
                // Optionally redirect to login or show auth modal
                // authUtils.redirectToLogin();
                throw new Error('Authentication required');
            }

            return response;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
};

// ================================================
// Enhanced Redux Slice (authSlice.ts) modifications
// ================================================

/*
// Add this to your authSlice.ts to handle auth errors better:

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authUtils } from '../utils/authUtils';

// Enhanced fetchUserProfile with error handling
export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            // Check token validity before making request
            if (!authUtils.isTokenValid()) {
                authUtils.clearAuth();
                return rejectWithValue('Invalid or expired token');
            }

            const response = await authUtils.fetchWithAuth('http://localhost:3000/api/user');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('fetchUserProfile: FAILED. Status:', response.status, 'Data:', errorData);

                // Handle specific auth errors
                if (response.status === 401 || response.status === 403) {
                    authUtils.clearAuth();
                    return rejectWithValue('Authentication failed');
                }

                return rejectWithValue(errorData.message || 'Failed to fetch user profile');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('fetchUserProfile error:', error);
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// In your auth slice extraReducers:
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
    },
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            authUtils.clearAuth();
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                // If auth failed, clear user data
                if (action.payload === 'Authentication failed' || action.payload === 'Invalid or expired token') {
                    state.user = null;
                    state.isAuthenticated = false;
                }
            });
    }
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
*/

export default authUtils;