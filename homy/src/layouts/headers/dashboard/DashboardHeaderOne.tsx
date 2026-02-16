import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../redux/slices/store";
import { logoutUser } from "../../../redux/slices/authSlice";
import { selectCurrentUser } from "../../../redux/slices/authSlice";

interface NavItem {
    path: string;
    label: string;
    iconPath: string;
    activeIconPath: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
    showDivider?: boolean;
}

interface DashboardHeaderOneProps {
    isActive: boolean;
    setIsActive: (active: boolean) => void;
}

const DashboardHeaderOne: React.FC<DashboardHeaderOneProps> = ({ isActive, setIsActive }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(selectCurrentUser);
    const [pathname, setPathname] = useState(window.location.pathname);

    // PHASE 1 & 2: Add collapse state with localStorage persistence
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const saved = localStorage.getItem('homy-dashboard-sidebar-collapsed');
            return saved === 'true';
        } catch (error) {
            console.error('Error reading sidebar state from localStorage:', error);
            return false;
        }
    });

    // Track expanding state for smooth text fade-in animation
    const [isExpanding, setIsExpanding] = useState(false);

    // Save and restore sidebar scroll position
    useEffect(() => {
        const sidebar = document.querySelector('.dash-aside-navbar');
        if (!sidebar) return;

        // Restore scroll position on mount
        try {
            const savedScrollPosition = localStorage.getItem('homy-dashboard-sidebar-scroll');
            if (savedScrollPosition) {
                sidebar.scrollTop = parseInt(savedScrollPosition, 10);
            }
        } catch (error) {
            console.error('Error restoring sidebar scroll position:', error);
        }

        // Save scroll position on scroll
        const handleScroll = () => {
            try {
                localStorage.setItem('homy-dashboard-sidebar-scroll', sidebar.scrollTop.toString());
            } catch (error) {
                console.error('Error saving sidebar scroll position:', error);
            }
        };

        sidebar.addEventListener('scroll', handleScroll);
        return () => sidebar.removeEventListener('scroll', handleScroll);
    }, []);

    // Update pathname when location changes
    useEffect(() => {
        setPathname(location.pathname);
    }, [location.pathname]);

    // PHASE 1 & 2: Save collapse state to localStorage and notify other components
    useEffect(() => {
        try {
            localStorage.setItem('homy-dashboard-sidebar-collapsed', isCollapsed.toString());
            // Dispatch custom event to notify other components in same window
            window.dispatchEvent(new Event('sidebar-collapse-change'));
        } catch (error) {
            console.error('Error saving sidebar state to localStorage:', error);
        }
    }, [isCollapsed]);

    // Check if user is an active ambassador
    const isActiveAmbassador = user?.isAmbassador && user?.ambassadorStatus === 'active';

    // Navigation configuration - EXACT COPY FROM ACTUAL CODEBASE
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
            title: 'Messaging',
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
        {
            title: 'Manage Listings',
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
            title: 'My Activity',
            showDivider: true,
            items: [
                {
                    path: '/dashboard/my-requests',
                    label: 'My Requests',
                    iconPath: '/assets/images/dashboard/icon/icon_2.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_2_active.svg',
                },
                {
                    path: '/dashboard/favourites',
                    label: 'Favorites',
                    iconPath: '/assets/images/dashboard/icon/icon_8.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_8_active.svg'
                },
                {
                    path: '/dashboard/my-agreements',
                    label: 'My Agreements',
                    iconPath: '/assets/images/dashboard/icon/icon_5.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_5_active.svg'
                },
            ]
        },
        {
            title: 'Ambassador',
            showDivider: true,
            items: [
                ...(isActiveAmbassador ? [{
                    path: '/dashboard/ambassador',
                    label: 'Ambassador Dashboard',
                    iconPath: '/assets/images/dashboard/icon/icon_6.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_6_active.svg'
                }] : []),
                {
                    path: '/dashboard/my-ambassador-requests',
                    label: 'My Ambassador Requests',
                    iconPath: '/assets/images/dashboard/icon/icon_2.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_2_active.svg'
                },
                {
                    path: '/dashboard/ambassador-requests',
                    label: 'Ambassador Responses',
                    iconPath: '/assets/images/dashboard/icon/icon_1.svg',
                    activeIconPath: '/assets/images/dashboard/icon/icon_1_active.svg'
                }
            ]
        }
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

    // PHASE 1 & 2: Toggle collapse function
    const handleToggleCollapse = () => {
        if (isCollapsed) {
            // Expanding: set expanding state to true
            setIsExpanding(true);
            setIsCollapsed(false);
            // Remove expanding class after animation completes
            setTimeout(() => setIsExpanding(false), 300);
        } else {
            // Collapsing: just collapse
            setIsCollapsed(true);
        }
    };

    // PHASE 3: Handle tooltip positioning on hover
    const handleTooltipPosition = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isCollapsed) {
            const rect = e.currentTarget.getBoundingClientRect();
            const top = rect.top + (rect.height / 2);
            e.currentTarget.style.setProperty('--tooltip-top', `${top}px`);
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
                    onMouseEnter={handleTooltipPosition}
                    data-label={item.label}
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
        <aside className={`dash-aside-navbar ${isActive ? "show" : ""} ${isCollapsed ? "collapsed" : ""} ${isExpanding ? "expanding" : ""}`}>
            <div className="position-relative">
                {/* PHASE 1 & 2: Toggle Button at Top - Hidden on mobile */}
                <button
                    onClick={handleToggleCollapse}
                    className="sidebar-collapse-btn d-none d-md-flex"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <img 
                        src="/assets/images/icon/arrow-left-from-line.svg" 
                        alt="Toggle"
                        className={isCollapsed ? "rotate-180" : ""}
                    />
                </button>

                {/* Header: Logo and Close Button */}
                <div className="logo d-md-block d-flex align-items-center justify-content-between plr bottom-line pb-30">
                    <Link to="/home" onClick={() => handleNavigation('/home')}>
                        {!isCollapsed && (
                            <img
                                src="/assets/images/logo/textlogo.png"
                                alt="Burrow Logo"
                                style={{ marginLeft: 0, width: 200, height: "auto" }}
                            />
                        )}
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
                        onMouseEnter={handleTooltipPosition}
                        data-label="Logout"
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
