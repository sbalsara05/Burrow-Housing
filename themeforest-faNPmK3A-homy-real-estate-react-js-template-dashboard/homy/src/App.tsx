// frontend/App.tsx
import React, { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AppNavigation from './navigation/Navigation';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./redux/store";
// Select the token directly from the Redux state now
import { fetchUserProfile, selectAuthStatus, selectAuthToken } from './redux/slices/authSlice';
import { fetchProfile } from './redux/slices/profileSlice';

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const token = useSelector(selectAuthToken); // *** Use token from Redux state ***
    const authStatus = useSelector(selectAuthStatus);

    useEffect(() => {
        // --- Condition to fetch user profile ---
        // 1. We MUST have a token in the Redux state.
        // 2. The auth process shouldn't already be 'loading' or 'succeeded'.
        //    This prevents re-fetching if already loaded or currently fetching.
        //    'idle' or 'failed' status allows a fetch attempt *if* a token exists.
        if (token && authStatus !== 'loading' && authStatus !== 'succeeded') {
            console.log(`App useEffect [authStatus=${authStatus}]: Token found in Redux state, status allows fetch. Dispatching fetchUserProfile.`);
            dispatch(fetchUserProfile()).then((action) => {
                // After fetching basic user info, fetch detailed profile only if successful
                if (fetchUserProfile.fulfilled.match(action)) {
                    console.log("App useEffect: User profile fetched, dispatching fetchProfile (detailed).");
                    dispatch(fetchProfile());
                } else if (fetchUserProfile.rejected.match(action)) {
                    // Error handled by the reducer (which will clear token state if 401/403)
                    console.log("App useEffect: fetchUserProfile failed. Reducer should handle state cleanup.");
                }
            });
        } else {
            // Log why the fetch didn't happen for debugging
            console.log(`App useEffect [authStatus=${authStatus}]: Conditions not met for fetchUserProfile (Redux token: ${!!token}, status: ${authStatus}).`);
        }
        // The dependency array relies on the token changing in Redux state.
        // If fetchUserProfile rejects with 401/403, the reducer sets token to null,
        // preventing this effect from re-dispatching fetchUserProfile.
    }, [dispatch, token, authStatus]); // Depend on token and status from Redux

    return (
        <HelmetProvider>
            <div className="main-page-wrapper">
                <AppNavigation />
            </div>
        </HelmetProvider>
    );
}

export default App;