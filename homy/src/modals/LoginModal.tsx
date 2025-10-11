// frontend/modals/LoginModal.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/slices/store';

// Import Forms
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import OtpVerificationForm from "../components/forms/OtpVerificationForm";
import ForgotPasswordForm from "../components/forms/ForgotPasswordForm";

// Import Redux Actions
import { resetVerificationFlag, clearAuthError } from '../redux/slices/authSlice';

interface LoginModalProps {
    loginModal: boolean;
    setLoginModal: (isOpen: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ loginModal, setLoginModal }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Single state to manage which view is currently active in the modal
    const [view, setView] = useState<'login' | 'register' | 'forgotPassword' | 'forgotPasswordSuccess' | 'otp'>('login');
    const [otpEmail, setOtpEmail] = useState("");

    // Effect to reset the modal's state whenever it is opened or closed
    useEffect(() => {
        if (!loginModal) {
            // Fully reset when the modal is hidden
            const timer = setTimeout(() => {
                setView('login');
                setOtpEmail("");
                dispatch(clearAuthError());
                dispatch(resetVerificationFlag());
            }, 300); // Delay to allow fade-out animation
            return () => clearTimeout(timer);
        } else {
            // Reset errors and flags when modal opens, keeping the active tab
            dispatch(clearAuthError());
            dispatch(resetVerificationFlag());
        }
    }, [loginModal, dispatch]);

    const handleTabClick = (index: number) => {
        const newView = index === 0 ? 'login' : 'register';
        setView(newView);
        dispatch(clearAuthError());
        dispatch(resetVerificationFlag());
    };

    const handleOtpRequired = (email: string) => {
        console.log("OTP Required for:", email);
        setOtpEmail(email);
        setView('otp');
    };

    const handleOtpGoBack = () => {
        setView('login'); // Always go back to login from OTP for simplicity
        setOtpEmail("");
        dispatch(clearAuthError());
        dispatch(resetVerificationFlag());
    };

    const handleVerificationSuccess = () => {
        setLoginModal(false); // Close the modal
        navigate('/dashboard/profile'); // Redirect to dashboard
    };

    const closeModal = () => {
        setLoginModal(false);
    };

    return (
        <div className={loginModal ? "login-modal-visible" : ""}>
            <div className={`modal fade ${loginModal ? "show" : ""}`} style={{ display: loginModal ? 'block' : 'none' }} id="loginModal" tabIndex={-1} aria-hidden={!loginModal}>
                <div className="modal-dialog modal-fullscreen modal-dialog-centered">
                    <div className="container">
                        <div className="user-data-form modal-content">
                            <button onClick={closeModal} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            <div className="form-wrapper m-auto">
                                {view === 'otp' ? (
                                    <OtpVerificationForm
                                        email={otpEmail}
                                        goBack={handleOtpGoBack}
                                        onSuccess={handleVerificationSuccess}
                                    />
                                ) : view === 'forgotPassword' ? (
                                    <>
                                        <div className="text-center mb-20">
                                            <h2>Reset Password</h2>
                                            <p className="fs-20 color-dark">Enter your email to receive a reset link.</p>
                                        </div>
                                        <ForgotPasswordForm
                                            onSuccess={() => setView('forgotPasswordSuccess')}
                                            goBack={() => setView('login')}
                                        />
                                    </>
                                ) : view === 'forgotPasswordSuccess' ? (
                                    <div className="text-center">
                                        <h2 className="mb-20">Check Your Inbox!</h2>
                                        <p className="fs-20 color-dark">If an account with that email exists, a password reset link has been sent.</p>
                                        <button onClick={() => setView('login')} className="btn-two w-100 text-uppercase d-block mt-30">
                                            BACK TO LOGIN
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <ul className="nav nav-tabs w-100" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button className={`nav-link ${view === 'login' ? 'active' : ''}`} onClick={() => handleTabClick(0)}>Login</button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className={`nav-link ${view === 'register' ? 'active' : ''}`} onClick={() => handleTabClick(1)}>Signup</button>
                                            </li>
                                        </ul>
                                        <div className="tab-content mt-30">
                                            <div className={`tab-pane fade ${view === 'login' ? 'show active' : ''}`}>
                                                <div className="text-center mb-20">
                                                    <h2>Welcome Back!</h2>
                                                    <p className="fs-20 color-dark">
                                                        Still don't have an account?{" "}
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleTabClick(1); }}>Sign up</a>
                                                    </p>
                                                </div>
                                                <LoginForm onOtpRequired={handleOtpRequired} />
                                                <div className="d-flex justify-content-end mt-10">
                                                    <a
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); setView('forgotPassword'); }}
                                                        className="fs-16"
                                                        style={{ textDecoration: 'underline' }}
                                                    >
                                                        Forgot Password?
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={`tab-pane fade ${view === 'register' ? 'show active' : ''}`}>
                                                <div className="text-center mb-20">
                                                    <h2>Register</h2>
                                                    <p className="fs-20 color-dark">
                                                        Already have an account?{" "}
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleTabClick(0); }}>Login</a>
                                                    </p>
                                                </div>
                                                <RegisterForm onOtpRequired={handleOtpRequired} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {loginModal && (
                <div
                    onClick={closeModal}
                    className="modal-backdrop fade show"
                    style={{ display: 'block' }}
                ></div>
            )}
        </div>
    );
};

export default LoginModal;