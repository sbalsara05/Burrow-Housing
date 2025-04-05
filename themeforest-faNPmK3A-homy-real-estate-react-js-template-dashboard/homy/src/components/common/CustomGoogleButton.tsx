import { useGoogleLogin } from '@react-oauth/google';
import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface CustomGoogleButtonProps {
    //onGoogleSuccess: (token: string) => Promise<void>;
    activeTab: number;  // assuming 0 is login, 1 is signup
}

export const CustomGoogleButton: React.FC<CustomGoogleButtonProps> = ({
    //onGoogleSuccess,
    activeTab
}) => {

    const navigate = useNavigate();  // Initialize the navigate function

    const handleGoogleLogin = async (response: any) => {
        try {
          console.log("Google response:", response);
          
          // Send the access token to your backend
          const backendResponse = await axios.post("http://localhost:3000/api/google", {
            access_token: response.access_token
          });
          
          console.log("Backend response:", backendResponse.data);
          
          if (backendResponse.status === 200) {
            console.log("Google login successful!");
            console.log("JWT token:", backendResponse.data.token);
            console.log("User info:", backendResponse.data.user);
            
            // Uncomment when ready
            localStorage.setItem("token", backendResponse.data.token);
            navigate(`/dashboard/profile`);
          }
        } catch (error: any) {
          console.error("Error during Google login:", error);
          
          if (error.response && error.response.data) {
            console.error("Error response:", error.response.data.message || "Google login failed!");
          } else {
            console.error("Something went wrong with Google login. Please try again.");
          }
        }
      };

    const login = useGoogleLogin({
        onSuccess: (response) => {
            // Google returns an access token which we can use to get user info
            // or send directly to our backend
            //onGoogleSuccess(response.access_token);
            console.log("Original Google response:", response);
            handleGoogleLogin(response);

        },
        onError: () => {
            console.error('Google Login Failed');
        }
    });

    return (
        <Link
            to=""
            onClick={(e) => {
                e.preventDefault();
                login();
            }}
            className="social-use-btn d-flex align-items-center justify-content-center tran3s w-100 mt-10"
        >
            <img src="/assets/images/icon/google.png" alt="google icon" />
            <span className="ps-3">
                {activeTab === 0 ? "Login with Google" : "Signup with Google"}
            </span>
        </Link>
    );
};
