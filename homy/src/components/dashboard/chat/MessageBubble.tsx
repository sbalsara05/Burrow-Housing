import React from 'react';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    isCurrentUser: boolean;
    type: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
}

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const renderMessageContent = () => {
        switch (message.type) {
            case 'image':
                return (
                    <div className="message-image">
                        <img
                            src={message.fileUrl}
                            alt="Shared image"
                            className="img-fluid rounded"
                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                        {message.message && (
                            <p className="mb-0 mt-2">{message.message}</p>
                        )}
                    </div>
                );

            case 'file':
                return (
                    <div className="message-file d-flex align-items-center p-2 border rounded">
                        <i className="bi bi-file-earmark fs-4 me-2 text-muted"></i>
                        <div className="flex-grow-1">
                            <p className="mb-0 fw-medium">{message.fileName}</p>
                            <small className="text-muted">Click to download</small>
                        </div>
                        <button className="btn btn-link p-1">
                            <i className="bi bi-download"></i>
                        </button>
                    </div>
                );

            default:
                return <p className="mb-0">{message.message}</p>;
        }
    };

    return (
        <div className={`message-bubble mb-3 d-flex ${message.isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`message-content ${message.isCurrentUser ? 'sent' : 'received'}`}>
                {/* Message Bubble */}
                <div
                    className={`message-text p-3 rounded-3 ${message.isCurrentUser
                            ? 'bg-primary text-white ms-auto'
                            : 'bg-light text-dark'
                        }`}
                    style={{ maxWidth: '70%' }}
                >
                    {/* Sender Name (for received messages) */}
                    {!message.isCurrentUser && (
                        <small className="d-block mb-1 fw-medium opacity-75">
                            {message.senderName}
                        </small>
                    )}

                    {/* Message Content */}
                    {renderMessageContent()}
                </div>

                {/* Timestamp */}
                <div className={`message-time mt-1 ${message.isCurrentUser ? 'text-end' : 'text-start'}`}>
                    <small className="text-muted">{message.timestamp}</small>
                    {message.isCurrentUser && (
                        <span className="ms-1">
                            <i className="bi bi-check2-all text-primary"></i>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;