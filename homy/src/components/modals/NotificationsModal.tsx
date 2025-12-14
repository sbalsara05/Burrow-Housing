import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/slices/store';
import {
	selectAllNotifications,
	deleteNotification,
	clearReadNotifications,
	Notification as NotificationType,
} from '../../redux/slices/notificationSlice';
import { toast } from 'react-toastify';

interface NotificationsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

// Helper function to format date (e.g., "3 hours ago", "1 day ago")
const timeSince = (date: string): string => {
	const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
	let interval = seconds / 31536000;
	if (interval > 1) return Math.floor(interval) + ' years ago';
	interval = seconds / 2592000;
	if (interval > 1) return Math.floor(interval) + ' months ago';
	interval = seconds / 86400;
	if (interval > 1) return Math.floor(interval) + ' days ago';
	interval = seconds / 3600;
	if (interval > 1) return Math.floor(interval) + ' hours ago';
	interval = seconds / 60;
	if (interval > 1) return Math.floor(interval) + ' minutes ago';
	return Math.floor(seconds) + ' seconds ago';
};

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const notifications = useSelector(selectAllNotifications);
	const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

	const handleDelete = async (e: React.MouseEvent, notification: NotificationType) => {
		e.preventDefault();
		e.stopPropagation();

		if (!notification.isRead) {
			if (!window.confirm('Are you sure you want to delete this unread notification?')) {
				return;
			}
		}

		try {
			await dispatch(deleteNotification(notification._id)).unwrap();
			toast.info('Notification removed.');
		} catch (error) {
			toast.error('Failed to remove notification.');
		}
	};

	const handleClearRead = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			await dispatch(clearReadNotifications()).unwrap();
			toast.info('Read notifications cleared.');
		} catch (error) {
			toast.error('Failed to clear notifications.');
		}
	};

	const handleNotificationClick = (link: string) => {
		navigate(link);
		onClose();
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

	const getTruncatedMessage = (message: string, isExpanded: boolean) => {
		const maxLength = 100;
		if (message.length <= maxLength) {
			return { text: message, needsTruncation: false };
		}

		if (isExpanded) {
			return { text: message, needsTruncation: true };
		} else {
			return { text: message.substring(0, maxLength), needsTruncation: true };
		}
	};

	const hasReadNotifications = notifications.some((n) => n.isRead);

	if (!isOpen) return null;

	return (
		<div
			className="modal fade show"
			style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
			onClick={onClose}
		>
			<div
				className="modal-dialog modal-dialog-centered modal-lg"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">All Notifications</h5>
						{hasReadNotifications && (
							<button
								onClick={handleClearRead}
								className="btn btn-sm btn-link text-decoration-underline me-auto ms-3 p-0"
							>
								Clear Read
							</button>
						)}
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							aria-label="Close"
						></button>
					</div>
					<div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
						{notifications.length > 0 ? (
							<div className="notifications-list">
								{notifications.map((item) => {
									const isExpanded = expandedNotifications.has(item._id);
									const messageData = getTruncatedMessage(item.message, isExpanded);

									return (
										<div
											key={item._id}
											className={`d-flex align-items-start mb-3 p-3 border rounded ${
												!item.isRead ? 'bg-light' : ''
											}`}
											style={{ position: 'relative' }}
										>
											<div
												className="flex-fill pe-3"
												onClick={() => handleNotificationClick(item.link)}
												style={{ cursor: 'pointer', minWidth: 0 }}
											>
												<h6 className="mb-1" style={{ wordBreak: 'break-word' }}>
													{messageData.text}
													{messageData.needsTruncation && !isExpanded && (
														<button
															onClick={(e) => toggleExpanded(e, item._id)}
															className="btn btn-link p-0 text-primary ms-2"
															style={{ fontSize: '0.875rem' }}
														>
															...
														</button>
													)}
													{messageData.needsTruncation && isExpanded && (
														<button
															onClick={(e) => toggleExpanded(e, item._id)}
															className="btn btn-link p-0 text-primary ms-2"
															style={{ fontSize: '0.875rem' }}
														>
															Show less
														</button>
													)}
												</h6>
												<span className="text-muted" style={{ fontSize: '0.75rem' }}>
													{timeSince(item.createdAt)}
												</span>
											</div>
											<button
												onClick={(e) => handleDelete(e, item)}
												className="btn btn-sm btn-link text-danger p-1"
												title="Delete notification"
												style={{ minWidth: 'auto', lineHeight: 1 }}
											>
												<i className="fa-regular fa-times-circle"></i>
											</button>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center p-5 text-muted">
								<p>You have no notifications.</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationsModal;
