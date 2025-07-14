import React from 'react';
import { Channel } from '../../../types/chat';

interface ChatListProps {
    channels: Channel[];
    activeChannel: Channel | null;
    onChannelSelect: (channel: Channel) => void;
    onCreateChannel?: () => void;
    isLoading?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
    channels,
    activeChannel,
    onChannelSelect,
    onCreateChannel,
    isLoading = false
}) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getChannelDisplayName = (channel: Channel) => {
        if (channel.name) {
            return channel.name;
        }

        // For direct messages, show other user's name
        if (channel.type === 'direct' && channel.members.length === 2) {
            const otherMember = channel.members.find(m => m.user.id !== 'current-user'); // Replace with actual current user ID
            return otherMember?.user.name || 'Unknown User';
        }

        return 'Unknown Channel';
    };

    const getChannelAvatar = (channel: Channel) => {
        if (channel.type === 'direct' && channel.members.length === 2) {
            const otherMember = channel.members.find(m => m.user.id !== 'current-user'); // Replace with actual current user ID
            return otherMember?.user.image || null;
        }
        return null;
    };

    const isUserOnline = (channel: Channel) => {
        if (channel.type === 'direct' && channel.members.length === 2) {
            const otherMember = channel.members.find(m => m.user.id !== 'current-user'); // Replace with actual current user ID
            return otherMember?.user.isOnline || false;
        }
        return false;
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading chats...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white h-100 d-flex flex-column">
            {/* Header */}
            <div className="p-3 border-bottom">
                <h5 className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>Messages</h5>
            </div>

            {/* Chat List */}
            <div className="flex-grow-1 overflow-auto">
                {channels.length > 0 ? (
                    channels.map((channel) => (
                        <div
                            key={channel.id}
                            className="p-3 cursor-pointer"
                            onClick={() => onChannelSelect(channel)}
                            style={{
                                cursor: 'pointer',
                                borderBottom: '1px solid #f8f9fa',
                                backgroundColor: activeChannel?.id === channel.id ? '#fff5f2' : 'transparent'
                            }}
                        >
                            <div className="d-flex align-items-center">
                                {/* Avatar */}
                                <div className="position-relative me-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: '#f8f9fa',
                                            color: '#6c757d',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {getChannelAvatar(channel) ? (
                                            <img
                                                src={getChannelAvatar(channel)}
                                                alt={getChannelDisplayName(channel)}
                                                className="rounded-circle"
                                                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.innerHTML =
                                                        `<span style="font-size: 16px">${getChannelDisplayName(channel).charAt(0).toUpperCase()}</span>`;
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '16px' }}>
                                                {getChannelDisplayName(channel).charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    {/* Online indicator */}
                                    {isUserOnline(channel) && (
                                        <span
                                            className="position-absolute bg-success rounded-circle border border-2 border-white"
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                bottom: '2px',
                                                right: '2px'
                                            }}
                                        ></span>
                                    )}
                                </div>

                                {/* Channel Info */}
                                <div className="flex-grow-1 overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <h6 className="mb-0 text-truncate">
                                            {getChannelDisplayName(channel)}
                                        </h6>
                                        {channel.lastMessage && (
                                            <small className="text-muted">
                                                {formatTime(channel.lastMessage.timestamp)}
                                            </small>
                                        )}
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <p className="mb-0 text-muted text-truncate" style={{ fontSize: '14px' }}>
                                            {channel.lastMessage?.text || 'No messages yet'}
                                        </p>
                                        {channel.unreadCount > 0 && (
                                            <span
                                                className="badge rounded-pill ms-2"
                                                style={{
                                                    backgroundColor: '#f46248',
                                                    color: '#f8f9fa',
                                                    fontSize: '11px',
                                                    minWidth: '25px',
                                                    height: '25px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    /* Empty State */
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
                        <i className="bi bi-chat-dots text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="text-muted">No conversations yet</h5>
                        <p className="text-muted mb-0">Start a new conversation to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;