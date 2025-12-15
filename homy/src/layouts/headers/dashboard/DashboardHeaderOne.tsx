import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/slices/store.ts';
import { logoutUser, selectCurrentUser } from '../../../redux/slices/authSlice';

interface DashboardHeaderOneProps {
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
}

interface NavItem {
    path: string;
    label: string;
    iconPath: string;
    activeIconPath: string;
}

interface NavSection {
    title?: string;
    items: NavItem[];
    showDivider?: boolean;
}

const DashboardHeaderOne: React.FC<DashboardHeaderOneProps> = ({ isActive, setIsActive }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(selectCurrentUser);
    const [pathname, setPathname] = useState(window.location.pathname);
    
    // Update pathname when location changes
    useEffect(() => {
        setPathname(location.pathname);
    }, [location.pathname]);
    
    const isChatPage = pathname === '/dashboard/chat';

    // Check if user is an active ambassador
    const isActiveAmbassador = user?.isAmbassador && user?.ambassadorStatus === 'active';

    // Navigation configuration
    const navSections: NavSection[] = [
        {
            title: 'Profile',
            items: [
                {
                    path: '/dashboard/profile',
                    label: 'Profile',
                    iconPath: '/assets/images/dashboard/icon/icon_3.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_3_active.svg'
                },
                {
                    path: '/dashboard/account-settings',
                    label: 'Account Settings',
                    iconPath: '/assets/images/dashboard/icon/icon_4.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_4_active.svg'
                }
            ]
        },
        {
            title: 'Manage Listings', // For Listers
            showDivider: true,
            items: [
                {
                    path: '/dashboard/properties-list',
                    label: 'My Properties',
                    iconPath: '/assets/images/dashboard/icon/icon_6.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_6_active.svg'
                },
                {
                    path: '/dashboard/add-property',
                    label: 'Add New Property',
                    iconPath: '/assets/images/dashboard/icon/icon_7.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_7_active.svg'
                },
                {
                    path: '/dashboard/received-requests',
                    label: 'Received Requests',
                    iconPath: '/assets/images/dashboard/icon/icon_1.svg', 
                    activeIconPath: '/assets/images/dashboard/icon/icon_1_active.svg',
                },
            ]
        },
        {
            title: 'My Activity', // For Renters
            showDivider: true,
            items: [
                {
                    path: '/dashboard/my-requests',
                    label: 'My Requests',
                    iconPath: '/assets/images/dashboard/icon/icon_2.svg', // Reusing an icon, can be changed
                    activeIconPath: '/assets/images/dashboard/icon/icon_2_active.svg',
                },
                {
                    path: '/dashboard/favourites',
                    label: 'Favorites',
                    iconPath: '/assets/images/dashboard/icon/icon_8.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_8_active.svg'
                },
            ]
        },
        {
            title: 'Messaging', // Dedicated Chat section
            showDivider: true,
            items: [
                {
                    path: '/dashboard/chat',
                    label: 'Chat',
                    iconPath: '/assets/images/icon/message-circle-more.svg',
                    activeIconPath: '/assets/images/icon/message-circle-more-active.svg'
                }
            ]
        },
        ...(isActiveAmbassador ? [{
            title: 'Ambassador', // Ambassador section
            showDivider: true,
            items: [
                {
                    path: '/dashboard/ambassador',
                    label: 'Ambassador Dashboard',
                    iconPath: '/assets/images/dashboard/icon/icon_6.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_6_active.svg'
                }
            ]
        }] : [])
    ];

    const handleNavigation = (path: string) => {
        setPathname(path);
        setIsActive(false);
        navigate(path);
    };

    const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        console.log("Logout button clicked");
        try {
            await dispatch(logoutUser()).unwrap();
            console.log("Logout dispatch completed, navigating...");
            navigate('/home');
            setIsActive(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const renderNavItem = (item: NavItem) => {
        const isActiveItem = pathname === item.path;
        return (
            <li key={item.path} className="plr">
                <Link
                    to={item.path}
                    className={`d-flex w-100 align-items-center ${isActiveItem ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                >
                    <img
                        src={isActiveItem ? item.activeIconPath : item.iconPath}
                        alt={`${item.label} Icon`}
                    />
                    <span>{item.label}</span>
                </Link>
            </li>
        );
    };

    const renderNavSection = (section: NavSection, index: number) => (
        <React.Fragment key={index}>
            {section.showDivider && (
                <li className="bottom-line pt-30 lg-pt-20 mb-40 lg-mb-30"></li>
            )}
            {section.title && (
                <li><div className="nav-title">{section.title}</div></li>
            )}
            {section.items.map(renderNavItem)}
        </React.Fragment>
    );

    return (
        <aside className={`dash-aside-navbar ${isActive ? "show" : ""}`}>
            <div className="position-relative">
                {/* Header: Logo and Close Button */}
                <div className="logo d-md-block d-flex align-items-center justify-content-between plr bottom-line pb-30">
                    <Link to="/home" onClick={() => handleNavigation('/home')}>
                        <img
                            src="/assets/images/logo/textlogo.png"
                            alt="Burrow Logo"
                            style={{ marginLeft: 0, width: 200, height: "auto" }}
                        />
                    </Link>
                    <button
                        onClick={() => setIsActive(false)}
                        className="close-btn d-block d-md-none"
                    >
                        <i className="fa-light fa-circle-xmark"></i>
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="dasboard-main-nav pt-30 pb-30 bottom-line">
                    <ul className="style-none">
                        {navSections.map(renderNavSection)}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="plr pt-30 pb-30">
                    <Link
                        to="#"
                        className="d-flex w-100 align-items-center logout-btn"
                        onClick={handleLogout}
                    >
                        <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle">
                            <img src="/assets/images/dashboard/icon/icon_41.svg" alt="Logout Icon" />
                        </div>
                        <span>Logout</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default DashboardHeaderOne;