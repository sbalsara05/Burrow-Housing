import React, { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AppNavigation from './navigation/Navigation';
import { useDispatch, useSelector } from "react-redux"; // Import hooks
import { AppDispatch, RootState } from "./redux/store"; // Import types
import { fetchUserProfile, selectAuthStatus, selectAuthToken } from './redux/slices/authSlice';

function App() {

    const dispatch = useDispatch<AppDispatch>();
    const authStatus = useSelector((state: RootState) => state.auth.status);
    const token = useSelector(selectAuthToken); // Get token from Redux state

    // Attempt to fetch user profile on initial load if a token exists and we haven't successfully loaded yet
    useEffect(() => {
        const tokenFromStorage = localStorage.getItem('token'); // Check storage as well
        // Only dispatch if we have a token and the status isn't already loading or succeeded
        if (tokenFromStorage && authStatus !== 'loading' && authStatus !== 'succeeded') {
            console.log("App Load: Attempting to fetch user profile with stored token.");
            dispatch(fetchUserProfile());
        }
    }, [dispatch, authStatus]); // Dependency array includes dispatch and authStatus

    return (
        <HelmetProvider>
            <div className="main-page-wrapper">
                <AppNavigation />
            </div>
        </HelmetProvider>
    );
}

export default App;
