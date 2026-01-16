import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import NavMenu from "./Menu/NavMenu";
import Offcanvas from "./Menu/Offcanvas";
import HeaderSearchbar from "./Menu/HeaderSearchbar";
import UseSticky from "../../hooks/UseSticky";
import LoginModal from "../../modals/LoginModal";
import MobileMenu from "./Menu/MobileMenu";
import { selectIsAuthenticated, selectAuthState } from "../../redux/slices/authSlice";
import { selectProfileState, fetchProfile } from "../../redux/slices/profileSlice";
import { AppDispatch } from "../../redux/slices/store";

interface HeaderTwoProps {
    style_1?: boolean;
    style_2?: boolean;
}

const HeaderTwo: React.FC<HeaderTwoProps> = ({ style_1, style_2 }) => {
    const { sticky } = UseSticky();
    const dispatch = useDispatch<AppDispatch>();
    
    // State management
    const [offCanvas, setOffCanvas] = useState<boolean>(false);
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [loginModal, setLoginModal] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);

    // Redux selectors
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const authState = useSelector(selectAuthState);
    const profileState = useSelector(selectProfileState);
    const user = authState.user;
    const profile = profileState.profile;

    // Fetch profile when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user && !profile) {
            dispatch(fetchProfile());
        }
    }, [isAuthenticated, user, profile, dispatch]);

    // Get logo source based on style
    const getLogoSrc = (): string => {
        if (style_2) return "/assets/images/logo/logo.png";
        if (style_1) return "/assets/images/logo/logo.png";
        return "/assets/images/icon/texticon.png";
    };

    // Handle login modal
    const handleAuthClick = () => {
        setLoginModal(true);
    };

    // Handle search click
    const handleSearchClick = () => {
        setIsSearch(true);
    };

    return (
        <>
            <div className={`theme-main-menu menu-overlay sticky-menu ${
                style_2 ? "menu-style-four" : 
                style_1 ? "menu-style-three" : 
                "menu-style-two"
            } ${sticky ? "fixed" : ""}`}>
                <div className={`inner-content ${style_2 ? "gap-two" : "gap-one"}`}>
                    <div className="top-header position-relative">
                        <div className="d-flex align-items-center">
                            
                            {/* Logo */}
                            <div className="logo order-lg-0">
                                <Link to="/" className="d-flex align-items-center">
                                    <img 
                                        src={getLogoSrc()} 
                                        alt="Burrow Housing Logo" 
                                        style={{ width: "80px", height: "auto" }} 
                                    />
                                </Link>
                            </div>

                            {/* Right Widget */}
                            <div className="right-widget ms-auto me-3 me-lg-0 order-lg-3">
                                <ul className="d-flex align-items-center style-none">
                                    {!style_2 ? (
                                        <>
                                            {/* Authentication Button - Show if not authenticated */}
                                            {!isAuthenticated && (
                                                <li className="d-flex align-items-center login-btn-one">
                                                    <i className="fa-regular fa-lock" style={{ transition: 'color 0.3s ease' }}></i>
                                                    <button 
                                                        onClick={handleAuthClick}
                                                        className="fw-500 tran3s btn btn-link p-0 ms-2"
                                                        style={{ 
                                                            textDecoration: 'none',
                                                            color: 'inherit',
                                                            border: 'none',
                                                            background: 'none',
                                                            transition: 'color 0.3s ease',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#fb6547';
                                                            e.currentTarget.previousElementSibling.style.color = '#fb6547';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'inherit';
                                                            e.currentTarget.previousElementSibling.style.color = 'inherit';
                                                        }}
                                                    >
                                                        Login <span className="d-none d-sm-inline-block">/ Sign up</span>
                                                    </button>
                                                </li>
                                            )}

                                            {/* Add Listing Button - Show if authenticated */}
                                            {isAuthenticated && (
                                                <li className="d-none d-md-inline-block ms-3 ms-xl-4 me-xl-4">
                                                    <Link 
                                                        to="/dashboard/add-property" 
                                                        className={style_1 ? "btn-ten" : "btn-two rounded-0"} 
                                                        target="_blank"
                                                    >
                                                        <span>Add Listing</span> 
                                                        <i className="fa-thin fa-arrow-up-right"></i>
                                                    </Link>
                                                </li>
                                            )}

                                            {/* Clean Profile Bar - Show if authenticated */}
                                            {isAuthenticated && user && (
                                                <li className="d-none d-md-inline-block">
                                                    <Link 
                                                        to="/dashboard/profile" 
                                                        className="d-flex align-items-center text-decoration-none"
                                                        style={{
                                                            border: '1px solid #e9ecef',
                                                            borderRadius: '25px',
                                                            padding: '8px 16px',
                                                            marginLeft: '15px',
                                                            transition: 'all 0.3s ease',
                                                            color: 'inherit'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#fb6547';
                                                            e.currentTarget.style.borderColor = '#fb6547';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'inherit';
                                                            e.currentTarget.style.borderColor = '#e9ecef';
                                                        }}
                                                    >
                                                        <div 
                                                            className="d-flex align-items-center justify-content-center me-2"
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '50%',
                                                                backgroundColor: '#f8f9fa',
                                                                color: '#333',
                                                                fontSize: '14px',
                                                                transition: 'all 0.3s ease',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            {profile?.image ? (
                                                                <img 
                                                                    src={profile.image} 
                                                                    alt="Profile" 
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <i className="fa-regular fa-user"></i>
                                                            )}
                                                        </div>
                                                        <span 
                                                            className="fw-500"
                                                            style={{
                                                                fontSize: '14px',
                                                                color: 'inherit',
                                                                transition: 'color 0.3s ease'
                                                            }}
                                                        >
                                                            {user.name || 'Profile'}
                                                        </span>
                                                    </Link>
                                                </li>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {/* Phone Number Link */}
                                            <li className="d-none d-md-flex align-items-center login-btn-one me-4 me-xxl-5">
                                                <i className="fa-regular fa-phone-volume"></i>
                                                <Link to="tel:+757-699-4478" className="tran3s">
                                                    +757 699-4478
                                                </Link>
                                            </li>

                                            {/* Login Button - Show if not authenticated */}
                                            {!isAuthenticated && (
                                                <li>
                                                    <button 
                                                        onClick={handleAuthClick}
                                                        className="rounded-circle tran3s d-flex align-items-center justify-content-center"
                                                        style={{ 
                                                            border: 'none',
                                                            background: '#fb6547',
                                                            color: 'white',
                                                            width: '40px',
                                                            height: '40px',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 2px 8px rgba(245, 74, 44, 0.2)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#e03e22';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 74, 44, 0.3)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#fb6547';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 74, 44, 0.2)';
                                                        }}
                                                        title="Login / Sign up"
                                                    >
                                                        <i className="fa-regular fa-lock"></i>
                                                    </button>
                                                </li>
                                            )}

                                            {/* Clean Profile Button - Show if authenticated */}
                                            {isAuthenticated && user && (
                                                <li>
                                                    <Link 
                                                        to="/dashboard/profile"
                                                        className="rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                                                        style={{
                                                            background: profile?.image ? 'transparent' : 'linear-gradient(135deg, #fb6547 0%, #e03e22 100%)',
                                                            border: 'none',
                                                            width: '40px',
                                                            height: '40px',
                                                            color: 'white',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 2px 8px rgba(245, 74, 44, 0.2)',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!profile?.image) {
                                                                e.currentTarget.style.background = 'linear-gradient(135deg, #e03e22 0%, #c73321 100%)';
                                                            }
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 74, 44, 0.3)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!profile?.image) {
                                                                e.currentTarget.style.background = 'linear-gradient(135deg, #fb6547 0%, #e03e22 100%)';
                                                            }
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 74, 44, 0.2)';
                                                        }}
                                                        title={`Go to ${user.name || 'User'}'s profile`}
                                                    >
                                                        {profile?.image ? (
                                                            <img 
                                                                src={profile.image} 
                                                                alt="Profile" 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <i className="fa-regular fa-user"></i>
                                                        )}
                                                    </Link>
                                                </li>
                                            )}

                                            {/* Search Button */}
                                            <li>
                                                <button 
                                                    onClick={handleSearchClick}
                                                    className="rounded-circle tran3s d-flex align-items-center justify-content-center"
                                                    style={{ 
                                                        border: 'none',
                                                        background: '#fb6547',
                                                        color: 'white',
                                                        width: '40px',
                                                        height: '40px',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 8px rgba(245, 74, 44, 0.2)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#e03e22';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 74, 44, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#fb6547';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 74, 44, 0.2)';
                                                    }}
                                                    title="Search"
                                                >
                                                    <i className="bi bi-search"></i>
                                                </button>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Navigation */}
                            <nav className="navbar navbar-expand-lg p0 ms-lg-5 order-lg-2">
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`navbar-toggler d-block d-lg-none ${isActive ? "hide-toggle" : ""}`}
                                    type="button"
                                    aria-label="Toggle navigation"
                                >
                                    <span></span>
                                </button>
                                <div className={`collapse navbar-collapse ${style_2 ? "ms-xl-5" : ""}`} id="navbarNav">
                                    <NavMenu />
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-components */}
            <MobileMenu isActive={isActive} />
            <Offcanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
            <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
            <HeaderSearchbar isSearch={isSearch} setIsSearch={setIsSearch} />
        </>
    );
};

export default HeaderTwo;