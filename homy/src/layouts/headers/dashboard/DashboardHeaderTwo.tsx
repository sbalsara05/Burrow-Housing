import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/slices/store';
import Notification from "./Notification";
import Profile from "./Profile";
import DashboardHeaderOne from "./DashboardHeaderOne";
import { selectProfile } from '../../../redux/slices/profileSlice';
import { selectCurrentUser } from '../../../redux/slices/authSlice';
import {
    fetchNotifications,
    markNotificationsAsRead,
    selectUnreadNotificationCount
} from '../../../redux/slices/notificationSlice';

interface DashboardHeaderTwoProps {
    title: string;
}

interface HeaderAction {
    id: string;
    type: 'notification' | 'button' | 'profile';
    className?: string;
    component?: React.ReactNode;
}

const DashboardHeaderTwo: React.FC<DashboardHeaderTwoProps> = ({ title }) => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const profile = useSelector(selectProfile);
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch<AppDispatch>();
    const unreadCount = useSelector(selectUnreadNotificationCount);
    const location = useLocation();

    useEffect(() => {
        dispatch(fetchNotifications(1)); // Fetch the first page of notifications
    }, [dispatch]);

    // Auto-open notifications dropdown if query param is present
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const shouldOpenNotifications = urlParams.get('openNotifications') === 'true';
        
        if (!shouldOpenNotifications) {
            return;
        }

        // Wait for DOM and Bootstrap to be ready
        const timer = setTimeout(() => {
            const button = document.getElementById('notification-dropdown') as HTMLButtonElement;
            
            if (!button) {
                return;
            }

            // Try Bootstrap 5 dropdown API first
            const bootstrap = (window as any).bootstrap;
            if (bootstrap?.Dropdown) {
                try {
                    const dropdown = bootstrap.Dropdown.getOrCreateInstance(button);
                    dropdown.show();
                    // Mark notifications as read if needed
                    if (unreadCount > 0) {
                        dispatch(markNotificationsAsRead());
                    }
                } catch (e) {
                    console.warn('Failed to open dropdown via Bootstrap API, using click fallback:', e);
                    // Fallback to manual click (this will trigger handleNotificationOpen via onClick)
                    button.click();
                }
            } else {
                // Fallback: trigger click event (this will trigger handleNotificationOpen via onClick)
                button.click();
            }
            
            // Clean up URL by removing query param after a brief delay
            setTimeout(() => {
                const currentParams = new URLSearchParams(window.location.search);
                if (currentParams.has('openNotifications')) {
                    currentParams.delete('openNotifications');
                    const newUrl = window.location.pathname + (currentParams.toString() ? `?${currentParams.toString()}` : '');
                    window.history.replaceState({}, '', newUrl);
                }
            }, 100);
        }, 500); // Delay to ensure Bootstrap and DOM are ready
        
        return () => clearTimeout(timer);
    }, [location.search, unreadCount, dispatch]);

    // Memoized avatar URL to prevent unnecessary recalculations
    const avatarSrc = useMemo(() => {
        if (profile?.image) {
            return profile.image
        }
        return "/assets/images/dashboard/no-profile-pic.png";
    }, [profile?.image]);

    const handleNotificationOpen = () => {
        // If there are unread notifications, dispatch action to mark them as read
        if (unreadCount > 0) {
            dispatch(markNotificationsAsRead());
        }
    };

    // Configuration for header actions
    const headerActions: HeaderAction[] = [
        {
            id: 'notification',
            type: 'notification',
            className: 'profile-notification position-relative dropdown-center ms-auto ms-md-5 me-4',
            component: (
                <>
                    <button
                        className="noti-btn dropdown-toggle"
                        type="button"
                        id="notification-dropdown"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        aria-expanded="false"
                        onClick={handleNotificationOpen} 
                    >
                        <img
                            src="/assets/images/dashboard/icon/icon_11.svg"
                            alt="Notifications"
                            className="lazy-img"
                        />
                        {unreadCount > 0 && <div className="badge-pill"></div>}
                    </button>
                    <Notification />
                </>
            )
        },
        {
            id: 'add-listing',
            type: 'button',
            className: 'd-none d-md-block me-3',
            component: (
                <Link to="/dashboard/add-property" className="btn-add-listing">
                    <span>Add Listing</span>
                    <i className="fa-thin fa-arrow-up-right"></i>
                </Link>
            )
        },
        {
            id: 'profile',
            type: 'profile',
            className: 'user-data position-relative',
            component: (
                <>
                    <button
                        className="d-flex align-items-center text-decoration-none dropdown-toggle"
                        type="button"
                        id="profile-dropdown"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        aria-expanded="false"
                        style={{
                            border: '1px solid #9ca3af',
                            borderRadius: '25px',
                            padding: '8px 16px',
                            transition: 'all 0.3s ease',
                            color: 'inherit',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#fb6547';
                            e.currentTarget.style.borderColor = '#fb6547';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'inherit';
                            e.currentTarget.style.borderColor = '#9ca3af';
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
                                src={avatarSrc} 
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                            {user?.name || 'Profile'}
                        </span>
                    </button>
                    <Profile />
                </>
            )
        }
    ];

    const renderHeaderAction = (action: HeaderAction) => (
        <div key={action.id} className={action.className}>
            {action.component}
        </div>
    );

    return (
        <>
            <header className="dashboard-header">
                <div className="d-flex align-items-center justify-content-between">
                    <h4 className="m0 d-none d-lg-block">{title}</h4>

                    <div className="d-flex align-items-center">
                        {/* Mobile Navigation Toggler */}
                        <button
                            onClick={() => setIsActive(true)}
                            className="dash-mobile-nav-toggler d-block d-md-none me-auto"
                            aria-label="Toggle mobile navigation"
                        >
                            <span></span>
                        </button>

                        {/* Header Actions */}
                        {headerActions.map(renderHeaderAction)}
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <DashboardHeaderOne isActive={isActive} setIsActive={setIsActive} />
        </>
    );
};

export default DashboardHeaderTwo;