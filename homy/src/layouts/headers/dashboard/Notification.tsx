import React, { useState } from 'react';
import { Link } from "react-router-dom";
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
    const notifications = useSelector(selectAllNotifications);

    // State to track which notifications are expanded (using array for React reactivity)
    const [expandedNotifications, setExpandedNotifications] = useState<string[]>([]);

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

    const toggleExpanded = (e: React.MouseEvent, notificationId: string) => {
        e.preventDefault();
        e.stopPropagation();

        setExpandedNotifications(prev => {
            const newState = prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId];
            console.log('Expanded notifications:', newState, 'for ID:', notificationId);
            return newState;
        });
    };

    // Function to truncate message and check if it needs truncation
    const getTruncatedMessage = (message: string, isExpanded: boolean) => {
        // Truncate at a shorter length to account for the dropdown width
        const maxLength = 60; 
        if (message.length <= maxLength) {
            return { text: message, needsTruncation: false };
        }

        // If expanded, show full message; otherwise show truncated
        return { 
            text: isExpanded ? message : message.substring(0, maxLength) + '...', 
            needsTruncation: true 
        };
    };

    const hasReadNotifications = notifications.some(n => n.isRead);

    // For contract notifications, ensure link goes to agreement screen (handles old notifications with /my-agreements)
    const getNotificationLink = (item: NotificationType): string | undefined => {
        const contractTypes = ['contract_pending', 'contract_tenant_signed', 'contract_completed', 'contract_payment_received'];
        const contractId = item.metadata?.contractId;
        if (contractTypes.includes(item.type) && contractId) {
            const id = typeof contractId === 'string' ? contractId : (contractId as { toString?: () => string })?.toString?.() ?? String(contractId);
            return `/dashboard/agreements/${id}/sign`;
        }
        return item.link;
    };

    return (
        <ul className="dropdown-menu" aria-labelledby="notification-dropdown" style={{ 
                position: 'absolute', 
                inset: '0px auto auto 0px', 
                margin: '0px', 
                transform: 'translate3d(-200px, 52px, 0px)',
                width: '500px',
                maxHeight: '600px',
                overflowY: 'auto'
            }}>
                <li>
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <h4 className="mb-0">Notifications</h4>
                        {hasReadNotifications && (
                            <button onClick={handleClearRead} className="btn btn-sm btn-link text-decoration-underline p-0">
                                Clear Read
                            </button>
                        )}
                    </div>

                {notifications.length > 0 ? (
                    <ul className="style-none notify-list">
                        {notifications.map((item) => {
                            const isExpanded = expandedNotifications.includes(item._id);
                            const messageData = getTruncatedMessage(item.message, isExpanded);

                            return (
                                <li
                                    key={`${item._id}-${isExpanded}`}
                                    className={`d-flex align-items-start ${!item.isRead ? 'unread' : ''}`}
                                    style={{ cursor: 'pointer', padding: '8px 12px', position: 'relative' }}
                                >
                                    {getNotificationLink(item) ? (
                                        <Link
                                            to={getNotificationLink(item)!}
                                            className="flex-fill pe-3 text-decoration-none text-dark d-block"
                                            style={{ minWidth: 0 }}
                                        >
                                            <h6 className="mb-1" style={{ wordBreak: 'break-word', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                                {messageData.text}
                                            </h6>
                                            {messageData.needsTruncation && (
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === 'Enter' && toggleExpanded(e as unknown as React.MouseEvent, item._id)}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleExpanded(e, item._id);
                                                    }}
                                                    className="btn btn-sm btn-link p-0 mt-1 d-block"
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: '#ff6b35',
                                                        textDecoration: 'none',
                                                        padding: '0',
                                                        fontWeight: '500',
                                                        display: 'block'
                                                    }}
                                                >
                                                    {isExpanded ? 'View less' : 'View more'}
                                                </span>
                                            )}
                                            <span className="time text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                                {timeSince(item.createdAt)}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div className="flex-fill pe-3" style={{ minWidth: 0 }}>
                                            <h6 className="mb-1" style={{ wordBreak: 'break-word', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                                {messageData.text}
                                            </h6>
                                            {messageData.needsTruncation && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => toggleExpanded(e, item._id)}
                                                    className="btn btn-sm btn-link p-0 mt-1 d-block"
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: '#ff6b35',
                                                        textDecoration: 'none',
                                                        padding: '0',
                                                        fontWeight: '500',
                                                        display: 'block'
                                                    }}
                                                >
                                                    {isExpanded ? 'View less' : 'View more'}
                                                </button>
                                            )}
                                            <span className="time text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                                {timeSince(item.createdAt)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="d-flex flex-column gap-1 align-items-end">
                                        <button
                                            onClick={(e) => handleDelete(e, item)}
                                            className="btn btn-sm btn-link text-danger p-1 flex-shrink-0"
                                            title="Delete notification"
                                            style={{
                                                minWidth: 'auto',
                                                lineHeight: 1
                                            }}
                                        >
                                            <i className="fa-regular fa-times-circle"></i>
                                        </button>
                                    </div>
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