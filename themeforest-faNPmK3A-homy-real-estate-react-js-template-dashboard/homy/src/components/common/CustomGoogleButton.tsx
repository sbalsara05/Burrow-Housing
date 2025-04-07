// frontend/components/common/CustomGoogleButton.tsx
import { useGoogleLogin } from '@react-oauth/google';
import React from 'react'; // Import React
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { googleSignIn, selectAuthLoading, selectAuthError, clearAuthError } from '../../redux/slices/authSlice'; // Corrected import path
import { AppDispatch } from '../../redux/store'; // Corrected import path
import { toast } from 'react-toastify';

interface CustomGoogleButtonProps {
    activeTab: number;  // assuming 0 is login, 1 is signup
    onSuccess?: () => void; // Optional callback on successful Google Sign-In + profile fetch
}

export const CustomGoogleButton: React.FC<CustomGoogleButtonProps> = ({ activeTab, onSuccess }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(selectAuthLoading);
    // Error selector might not be strictly needed here if toasts handle errors
    // const error = useSelector(selectAuthError);
    const navigate = useNavigate();

    const handleGoogleSuccess = async (tokenResponse: any) => {
        // tokenResponse contains the access_token from Google
        if (!tokenResponse.access_token) {
            toast.error('Google Sign-In failed: No access token received.', { position: 'top-center' });
            return;
        }

        dispatch(clearAuthError()); // Clear previous errors
        const resultAction = await dispatch(googleSignIn({ access_token: tokenResponse.access_token }));

        if (googleSignIn.fulfilled.match(resultAction)) {
            toast.success("Google login successful!", { position: "top-center" });
            navigate(`/dashboard/profile`); // Navigate after Redux state is updated
            if (onSuccess) onSuccess(); // Call success callback (e.g., close modal)
        } else if (googleSignIn.rejected.match(resultAction)) {
            toast.error(resultAction.payload as string || "Google login failed!", { position: "top-center" });
        }
    };

    const login = useGoogleLogin({
        onSuccess: handleGoogleSuccess, // Use the handler that dispatches Redux action
        onError: (errorResponse) => { // Added errorResponse for more detail potentially
            console.error('Google Login Failed:', errorResponse);
            toast.error('Google Login Failed. Please try again.', { position: "top-center" });
        }
        // flow: 'auth-code', // Use 'auth-code' flow if you need server-side validation with code
    });

    return (
        <button // Use a button element
            onClick={(e) => {
                e.preventDefault(); // Prevent any default form behavior if it's inside one
                if (!isLoading) { // Prevent clicking while another auth process is loading
                    login();
                }
            }}
            className="social-use-btn d-flex align-items-center justify-content-center tran3s w-100 mt-10"
            disabled={isLoading} // Disable during any auth loading
            type="button" // Explicitly set type
        >
            <img src="/assets/images/icon/google.png" alt="" /> {/* Alt text */}
            <span className="ps-3">
                {isLoading ? 'PROCESSING...' : (activeTab === 0 ? "Login with Google" : "Signup with Google")}
            </span>
        </button>
    );
};