import React, { useState, useMemo, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/slices/store';
import Notification from "./Notification";
import Profile from "./Profile";
import DashboardHeaderOne from "./DashboardHeaderOne";
import { selectProfile } from '../../../redux/slices/profileSlice';
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
    const dispatch = useDispatch<AppDispatch>();
    const unreadCount = useSelector(selectUnreadNotificationCount);

    useEffect(() => {
        dispatch(fetchNotifications(1)); // Fetch the first page of notifications
    }, [dispatch]);

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
                <Link to="/dashboard/add-property" className="btn-two">
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
                        className="user-avatar online position-relative rounded-circle dropdown-toggle"
                        type="button"
                        id="profile-dropdown"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        aria-expanded="false"
                    >
                        <img
                            src={avatarSrc}
                            alt="User Avatar"
                            className="lazy-img"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
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
                <div className="d-flex align-items-center justify-content-end">
                    <h4 className="m0 d-none d-lg-block">{title}</h4>

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
            </header>

            {/* Mobile Sidebar */}
            <DashboardHeaderOne isActive={isActive} setIsActive={setIsActive} />
        </>
    );
};

export default DashboardHeaderTwo;