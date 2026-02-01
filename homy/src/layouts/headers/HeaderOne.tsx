import {useState, useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Link} from "react-router-dom";
import NavMenu from "./Menu/NavMenu";
import UseSticky from "../../hooks/UseSticky";
import LoginModal from "../../modals/LoginModal";
import MobileMenu from "./Menu/MobileMenu";
import {selectIsAuthenticated, selectAuthState} from "../../redux/slices/authSlice";
import {selectProfileState, fetchProfile} from "../../redux/slices/profileSlice";
import {AppDispatch} from "../../redux/slices/store";

const HeaderOne = ({style}: any) => {
    const [loginModal, setLoginModal] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const {sticky} = UseSticky();
    const dispatch = useDispatch<AppDispatch>();

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

    // Construct profile image URL
    const getProfileImageUrl = () => {
        if (profile?.image) {
            // If the image path is relative, construct full URL
            if (profile.image.startsWith('http')) {
                return profile.image;
            } else {
                return `https://burrowhousing.com/${profile.image.replace(/\\/g, '/')}`;
            }
        }
        return "/assets/images/dashboard/no-profile-pic.png";
    };

    return (
        <>
            <header className={`theme-main-menu menu-overlay menu-style-one sticky-menu ${sticky ? "fixed" : ""}`}>
                {!style && (
                    <div className="alert-wrapper text-center">
                        <p className="fs-16 m0 text-white">The <Link to="/listing_01" className="fw-500">flash
                            sale</Link> go on. The offer will end in — <span>This Sunday</span></p>
                    </div>
                )}
                <div className="inner-content gap-one">
                    <div className="top-header position-relative">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="logo order-lg-0">
                                <Link to="/" className="d-flex align-items-center">
                                    <img src="/assets/images/logo/logo.png" alt="Burrow Logo"
                                         style={{width: "100px", height: "auto"}}/>
                                </Link>
                            </div>
                            <div className="right-widget ms-auto ms-lg-0 me-3 me-lg-0 order-lg-3">
                                <ul className="d-flex align-items-center style-none">
                                    {isAuthenticated ? (
                                        <>
                                            {/* Add Listing Button */}
                                            <li className="d-none d-md-inline-block">
                                                <Link to="/dashboard/add-property" className="btn-two" target="_blank">
                                                    <span>Add Listing</span> <i
                                                    className="fa-thin fa-arrow-up-right"></i>
                                                </Link>
                                            </li>

                                            {/* User Profile - only show when logged in */}
                                            {user && (
                                                <li className="d-none d-md-inline-block ms-3">
                                                    <Link 
                                                        to="/dashboard/profile" 
                                                        className="d-flex align-items-center text-decoration-none"
                                                        style={{
                                                            border: '1px solid #e9ecef',
                                                            borderRadius: '25px',
                                                            padding: '8px 16px',
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
                                                            <img 
                                                                src={getProfileImageUrl()} 
                                                                alt={user.name || 'User'}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = "/assets/images/dashboard/no-profile-pic.png";
                                                                }}
                                                            />
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
                                        // If user is not authenticated, show "Login" button
                                        <li>
                                            <a onClick={() => setLoginModal(true)} data-bs-toggle="modal"
                                               data-bs-target="#loginModal" className="btn-one"
                                               style={{cursor: "pointer"}}>
                                                <i className="fa-regular fa-lock"></i> <span>Login</span>
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <nav className="navbar navbar-expand-lg p0 order-lg-2">
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`navbar-toggler d-block d-lg-none ${isActive ? "hide-toggle" : ""}`}
                                    type="button"
                                >
                                    <span></span>
                                </button>
                                <div className="collapse navbar-collapse" id="navbarNav">
                                    <NavMenu/>
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            <MobileMenu isActive={isActive}/>
            <LoginModal loginModal={loginModal} setLoginModal={setLoginModal}/>
        </>
    );
};

export default HeaderOne;