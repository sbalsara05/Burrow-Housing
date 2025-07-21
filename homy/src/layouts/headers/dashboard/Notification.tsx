import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/slices/store';
import {
    selectAllNotifications,
    deleteNotification,
    clearReadNotifications,
    Notification as NotificationType // Rename imported type
} from '../../../redux/slices/notificationSlice';
import { toast } from 'react-toastify';

// Helper function to format date (e.g., "3 hours ago", "1 day ago")
const timeSince = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const Notification: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const notifications = useSelector(selectAllNotifications);

    const handleDelete = async (e: React.MouseEvent, notification: NotificationType) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation(); // Stop event from bubbling up

        if (!notification.isRead) {
            if (!window.confirm("Are you sure you want to delete this unread notification?")) {
                return;
            }
        }

        try {
            await dispatch(deleteNotification(notification._id)).unwrap();
            toast.info("Notification removed.");
        } catch (error) {
            toast.error("Failed to remove notification.");
        }
    };

    const handleClearRead = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await dispatch(clearReadNotifications()).unwrap();
            toast.info("Read notifications cleared.");
        } catch (error) {
            toast.error("Failed to clear notifications.");
        }
    };

    const handleNotificationClick = (link: string) => {
        navigate(link);
    };

    const hasReadNotifications = notifications.some(n => n.isRead);

    return (
        <ul className="dropdown-menu" aria-labelledby="notification-dropdown" style={{ position: 'absolute', inset: '0px auto auto 0px', margin: '0px', transform: 'translate3d(-151.273px, 52px, 0px)' }}>
            <li>
                <div className="d-flex justify-content-between align-items-center">
                    <h4>Notifications</h4>
                    {hasReadNotifications && (
                        <button onClick={handleClearRead} className="btn btn-sm btn-link text-decoration-underline p-0">
                            Clear Read
                        </button>
                    )}
                </div>

                {notifications.length > 0 ? (
                    <ul className="style-none notify-list">
                        {notifications.map((item) => (
                            <li
                                key={item._id}
                                className={`d-flex align-items-center ${!item.isRead ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(item.link)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="flex-fill ps-2">
                                    <h6>{item.message}</h6>
                                    <span className="time">{timeSince(item.createdAt)}</span>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, item)}
                                    className="btn btn-sm btn-link text-danger p-0 ms-2"
                                    title="Delete notification"
                                >
                                    <i className="fa-regular fa-times-circle"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center p-3 text-muted">
                        You have no new notifications.
                    </div>
                )}
            </li>
        </ul>
    );
};

export default Notification;