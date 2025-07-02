// src/components/common/ProtectedRoute.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthStatus, selectAuthToken } from "../redux/slices/authSlice";

const ProtectedRoute = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const authStatus = useSelector(selectAuthStatus);
    const token = useSelector(selectAuthToken);
    // Show the loading spinner ONLY IF:
    // 1. The status is 'loading' (actively fetching).
    // 2. The status is 'idle' BUT a token exists (meaning App.tsx is about to fetch).
    if (authStatus === 'loading' || (authStatus === 'idle' && token)) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
                <h2>Loading Session...</h2>
            </div>
        );
    }

    // After the loading check, if the user is authenticated, allow access.
    if (isAuthenticated) {
        return <Outlet />;
    }

    // If we get here, it means loading is finished and the user is NOT authenticated. Redirect them.
    return <Navigate to="/home-three" replace />;
};

export default ProtectedRoute;