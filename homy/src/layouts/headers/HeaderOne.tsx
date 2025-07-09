import {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import NavMenu from "./Menu/NavMenu";
import UseSticky from "../../hooks/UseSticky";
import LoginModal from "../../modals/LoginModal";
import MobileMenu from "./Menu/MobileMenu";
import {selectIsAuthenticated, selectAuthState} from "../../redux/slices/authSlice";

const HeaderOne = ({style}: any) => {
    const [loginModal, setLoginModal] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const {sticky} = UseSticky();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const authState = useSelector(selectAuthState);
    const user = authState.user;

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
                                                <li className="d-none d-md-inline-block tw-pl-5">
                                                    <div className="user-profile d-flex align-items-center">
                                                        <div className="user-avatar me-2">
                                                            <div
                                                                className="tw-bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-500 tw-pt-1 tw-h-14 tw-w-14"
                                                                // style={{
                                                                //     width: '32px',
                                                                //     height: '32px',
                                                                //     fontSize: '14px'
                                                                // }}
                                                            >
                                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                        </div>
                                                        {/*<div className="user-info">*/}
                                                        {/*    <div className="user-name fw-500 text-dark"*/}
                                                        {/*         style={{fontSize: '14px', lineHeight: '1.2'}}>*/}
                                                        {/*        {user.name || 'User'}*/}
                                                        {/*    </div>*/}
                                                        {/*</div>*/}
                                                    </div>
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