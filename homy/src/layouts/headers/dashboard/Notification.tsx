import React, { useState } from 'react';
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

    // State to track which notifications are expanded
    const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

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

    const toggleExpanded = (e: React.MouseEvent, notificationId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const newExpanded = new Set(expandedNotifications);
        if (newExpanded.has(notificationId)) {
            newExpanded.delete(notificationId);
        } else {
            newExpanded.add(notificationId);
        }
        setExpandedNotifications(newExpanded);
    };

    // Function to truncate message and check if it needs truncation
    const getTruncatedMessage = (message: string, isExpanded: boolean) => {
        const maxLength = 50; // Adjust this value as needed
        if (message.length <= maxLength) {
            return { text: message, needsTruncation: false };
        }

        if (isExpanded) {
            return { text: message, needsTruncation: true };
        } else {
            return { text: message.substring(0, maxLength), needsTruncation: true };
        }
    };

    const hasReadNotifications = notifications.some(n => n.isRead);

    return (
        <ul className="dropdown-menu" aria-labelledby="notification-dropdown" style={{ position: 'absolute', inset: '0px auto auto 0px', margin: '0px', transform: 'translate3d(-151.273px, 52px, 0px)' }}>
            <li>
                <div className="d-flex justify-content-between align-items-center">
                    <h4>Notifications</h4>
                    {hasReadNotifications && (
                        <button onClick={handleClearRead} className="btn btn-sm btn-link text-decoration-underline tw-pb-6">
                            Clear Read
                        </button>
                    )}
                </div>

                {notifications.length > 0 ? (
                    <ul className="style-none notify-list">
                        {notifications.map((item) => {
                            const isExpanded = expandedNotifications.has(item._id);
                            const messageData = getTruncatedMessage(item.message, isExpanded);

                            return (
                                <li
                                    key={item._id}
                                    className={`d-flex align-items-start ${!item.isRead ? 'unread' : ''}`}
                                    style={{ cursor: 'pointer', padding: '8px 12px', position: 'relative' }}
                                >
                                    <div
                                        className="flex-fill pe-3"
                                        onClick={() => handleNotificationClick(item.link)}
                                        style={{ minWidth: 0 }} // This allows the flex item to shrink
                                    >
                                        <h6 className="mb-1" style={{ wordBreak: 'break-word' }}>
                                            {messageData.text}
                                            {messageData.needsTruncation && !isExpanded && (
                                                <button
                                                    onClick={(e) => toggleExpanded(e, item._id)}
                                                    className="btn btn-link p-0 text-primary"
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        textDecoration: 'none',
                                                        marginLeft: '8px' // Added more spacing
                                                    }}
                                                >
                                                    ...
                                                </button>
                                            )}
                                            {messageData.needsTruncation && isExpanded && (
                                                <button
                                                    onClick={(e) => toggleExpanded(e, item._id)}
                                                    className="btn btn-link p-0 text-primary"
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        textDecoration: 'none',
                                                        marginLeft: '8px' // Added more spacing
                                                    }}
                                                >
                                                    Show less
                                                </button>
                                            )}
                                        </h6>
                                        <span className="time text-muted" style={{ fontSize: '0.75rem' }}>
                                            {timeSince(item.createdAt)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, item)}
                                        className="btn btn-sm btn-link text-danger p-1 flex-shrink-0"
                                        title="Delete notification"
                                        style={{
                                            minWidth: 'auto',
                                            lineHeight: 1,
                                            position: 'absolute',
                                            right: '8px',
                                            top: '8px'
                                        }}
                                    >
                                        <i className="fa-regular fa-times-circle"></i>
                                    </button>
                                </li>
                            );
                        })}
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