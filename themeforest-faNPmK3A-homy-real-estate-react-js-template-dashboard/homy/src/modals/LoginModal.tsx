import { useState } from "react"
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import OtpVerificationForm from "../components/forms/OtpVerificationForm";
import { Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { CustomGoogleButton } from '../components/common/CustomGoogleButton';

const tab_title: string[] = ["Login", "Signup",];

const LoginModal = ({ loginModal, setLoginModal }: any) => {
    const [activeTab, setActiveTab] = useState(0);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [previousTab, setPreviousTab] = useState(0);

    const handleTabClick = (index: any) => {
        setActiveTab(index);
    };

    const handleOtpRequired = (email: string) => {
        setPreviousTab(activeTab); // Store current tab
        setOtpEmail(email);
        setShowOtpForm(true);
    };

    const handleOtpGoBack = () => {
        setShowOtpForm(false);
        // Return to the previously active tab
        setActiveTab(previousTab);
    };

    const handleVerificationSuccess = () => {
        setShowOtpForm(false);
        setLoginModal(false); // Close the modal on successful verification
    };

    return (
        <div className={loginModal ? "login-modal-visible" : ""}>
            <div className="modal fade" id="loginModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-fullscreen modal-dialog-centered">
                    <div className="container">
                        <div className="user-data-form modal-content">
                            <button onClick={() => setLoginModal(false)} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            <div className="form-wrapper m-auto">
                                {!showOtpForm ? (
                                    <>
                                        <ul className="nav nav-tabs w-100">
                                            {tab_title.map((tab, index) => (
                                                <li key={index} onClick={() => handleTabClick(index)} className="nav-item">
                                                    <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="tab-content mt-30">
                                            <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`}>
                                                <div className="text-center mb-20">
                                                    <h2>Welcome Back!</h2>
                                                    <p className="fs-20 color-dark">Still don&apos;t have an account? <Link to="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveTab(1); // Switch to Signup tab
                                                        }}
                                                    >Sign up</Link></p>
                                                </div>
                                                <LoginForm onOtpRequired={handleOtpRequired} />
                                            </div>

                                            <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`}>
                                                <div className="text-center mb-20">
                                                    <h2>Register</h2>
                                                    <p className="fs-20 color-dark">Already have an account? <Link to="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveTab(0); // Switch to login tab
                                                        }}>Login</Link></p>
                                                </div>
                                                <RegisterForm onOtpRequired={handleOtpRequired} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <OtpVerificationForm
                                        email={otpEmail}
                                        goBack={handleOtpGoBack}
                                        onSuccess={handleVerificationSuccess}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div onClick={() => setLoginModal(false)} className={`offcanvas-backdrop fade ${loginModal ? "show" : ""}`}></div>
        </div>
    )
}

export default LoginModal