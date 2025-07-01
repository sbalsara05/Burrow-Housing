// frontend/modals/LoginModal.tsx
import React, { useState, useEffect } from "react"; // Import React
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import OtpVerificationForm from "../components/forms/OtpVerificationForm";
import { Link, useNavigate } from "react-router-dom";
//import { CustomGoogleButton } from '../components/common/CustomGoogleButton';
import { useDispatch } from 'react-redux';
import { resetVerificationFlag, clearAuthError } from '../redux/slices/authSlice'; // Import actions
import { AppDispatch } from '../redux/slices/store.ts';

const tab_title: string[] = ["Login", "Signup"];

interface LoginModalProps {
    loginModal: boolean;
    setLoginModal: (isOpen: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ loginModal, setLoginModal }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState(0);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [previousTab, setPreviousTab] = useState(0); // To remember the tab before OTP
    const navigate = useNavigate();

    // Reset state when modal opens or closes
    useEffect(() => {
        if (!loginModal) {
            // Reset everything when modal is hidden
            setShowOtpForm(false);
            setOtpEmail("");
            setActiveTab(0);
            dispatch(clearAuthError());
            dispatch(resetVerificationFlag());
        } else {
            // Reset errors and flags when modal opens, but keep activeTab
            setShowOtpForm(false); // Ensure OTP form isn't shown initially
            setOtpEmail("");
            dispatch(clearAuthError());
            dispatch(resetVerificationFlag());
        }
    }, [loginModal, dispatch]); // Depend on loginModal


    const handleTabClick = (index: number) => {
        if (showOtpForm) return; // Prevent tab switching during OTP
        setActiveTab(index);
        dispatch(clearAuthError()); // Clear errors when switching tabs
        dispatch(resetVerificationFlag()); // Also clear OTP flag if switching away
    };

    const handleOtpRequired = (email: string) => {
        console.log("OTP Required for:", email); // Debug log
        setPreviousTab(activeTab); // Store the current tab index
        setOtpEmail(email);
        setShowOtpForm(true); // Set state to show OTP form
    };

    const handleOtpGoBack = () => {
        setShowOtpForm(false);
        setOtpEmail("");
        setActiveTab(previousTab); // Return to the previous tab (Login or Signup)
        dispatch(clearAuthError());
        dispatch(resetVerificationFlag()); // Reset flag on going back
    };

    // Called by OtpVerificationForm on successful verification
    const handleVerificationSuccess = () => {
        setShowOtpForm(false);
        setOtpEmail("");
        setLoginModal(false); // Close the modal
        navigate('/dashboard/profile');
    };

    // Called by CustomGoogleButton on successful Google sign-in
    const handleGoogleSuccess = () => {
        setLoginModal(false); // Close modal
    }

    const closeModal = () => {
        setLoginModal(false);
        // State reset happens in the useEffect listening to loginModal
    };

    return (
        <div className={loginModal ? "login-modal-visible" : ""}>
            {/* Bootstrap Modal Structure */}
            <div className={`modal fade ${loginModal ? "show" : ""}`} style={{ display: loginModal ? 'block' : 'none' }} id="loginModal" tabIndex={-1} aria-hidden={!loginModal} aria-modal={loginModal}>
                <div className="modal-dialog modal-fullscreen modal-dialog-centered">
                    <div className="container">
                        <div className="user-data-form modal-content">
                            {/* Close Button */}
                            <button onClick={closeModal} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

                            {/* Content Area */}
                            <div className="form-wrapper m-auto">
                                {!showOtpForm ? (
                                    <>
                                        {/* Tabs: Login / Signup */}
                                        <ul className="nav nav-tabs w-100" role="tablist">
                                            {tab_title.map((tab, index) => (
                                                <li key={index} className="nav-item" role="presentation">
                                                    <button
                                                        className={`nav-link ${activeTab === index ? "active" : ""}`}
                                                        onClick={() => handleTabClick(index)}
                                                        type="button" role="tab" aria-selected={activeTab === index}
                                                    >
                                                        {tab}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Tab Content */}
                                        <div className="tab-content mt-30">
                                            {/* Login Form Pane */}
                                            <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} role="tabpanel">
                                                <div className="text-center mb-20">
                                                    <h2>Welcome Back!</h2>
                                                    <p className="fs-20 color-dark">
                                                        Still don't have an account?{" "}
                                                        <Link to="#" onClick={(e) => { e.preventDefault(); handleTabClick(1); }}>
                                                            Sign up
                                                        </Link>
                                                    </p>
                                                </div>
                                                <LoginForm onOtpRequired={handleOtpRequired} />
                                            </div>

                                            {/* Register Form Pane */}
                                            <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} role="tabpanel">
                                                <div className="text-center mb-20">
                                                    <h2>Register</h2>
                                                    <p className="fs-20 color-dark">
                                                        Already have an account?{" "}
                                                        <Link to="#" onClick={(e) => { e.preventDefault(); handleTabClick(0); }}>
                                                            Login
                                                        </Link>
                                                    </p>
                                                </div>
                                                <RegisterForm onOtpRequired={handleOtpRequired} />
                                            </div>
                                        </div>

                                        {/* OR Separator & Social Login */}
                                        {/* <div className="d-flex align-items-center mt-30 mb-10">
                                            <div className="line"></div>
                                            <span className="pe-3 ps-3 fs-6">OR</span>
                                            <div className="line"></div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <CustomGoogleButton activeTab={activeTab} onSuccess={handleGoogleSuccess} />
                                            </div>
                                        </div> */}
                                    </>
                                ) : (
                                    // OTP Verification Form
                                    <OtpVerificationForm
                                        email={otpEmail} // Pass the email that needs verification
                                        goBack={handleOtpGoBack} // Pass the function to go back
                                        onSuccess={handleVerificationSuccess} // Pass the function for success
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Backdrop */}
            <div
                onClick={closeModal}
                className={`modal-backdrop fade ${loginModal ? "show" : ""}`}
                style={{ display: loginModal ? 'block' : 'none' }} // Ensure backdrop visibility matches modal
            ></div>
        </div>
    );
};

export default LoginModal;