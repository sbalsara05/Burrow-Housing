import React from 'react';
import { Message } from '../../../types/chat';

interface MessageBubbleProps {
    message: Message;
    currentUserId: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
    const isCurrentUser = message.senderId === currentUserId;

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`d-flex mb-2 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>            {/* Avatar for received messages */}
            {!isCurrentUser && (
                <div className="me-2">
                    <div
                        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px', fontSize: '14px' }}
                    >
                        {message.senderName.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

            {/* Message Content */}
            <div style={{ maxWidth: '70%' }}>
                {/* Sender Name for received messages */}
                {!isCurrentUser && (
                    <small className="text-muted d-block mb-1">{message.senderName}</small>
                )}

                {/* Message Bubble */}
                <div
                    className={`px-3 py-2 ${isCurrentUser
                        ? 'text-white'
                        : ''
                        }`}
                    style={{
                        backgroundColor: isCurrentUser ? '#f46248' : '#f8f9fa',
                        borderRadius: '16px',
                        border: 'none'
                    }}
                >
                    <p className="mb-1">{message.text}</p>
                    <div className="d-flex justify-content-between align-items-center">
                        <small
                            className={`${isCurrentUser ? 'text-white-50' : 'text-muted'
                                }`}
                            style={{ fontSize: '11px' }}
                        >
                            {formatTime(message.timestamp)}
                        </small>
                        {/* Delivery Status */}
                        {isCurrentUser && message.deliveryStatus && (
                            <small className="ms-2 text-white-50" style={{ fontSize: '11px' }}>
                                {message.deliveryStatus === 'read' && '✓✓'}
                                {message.deliveryStatus === 'delivered' && '✓'}
                                {message.deliveryStatus === 'sent' && '•'}
                            </small>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;