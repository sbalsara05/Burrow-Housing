import React, { useState, useEffect, useRef } from 'react';
import { Channel, Message } from '../../../types/chat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
    activeChannel: Channel | null;
    messages: Message[];
    currentUserId: string;
    isLoadingMessages: boolean;
    isSendingMessage: boolean;
    onSendMessage: (text: string) => void;
    onBackToList?: () => void;
    onLoadMoreMessages?: () => void;
    isFullScreen?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    activeChannel,
    messages,
    currentUserId,
    isLoadingMessages,
    isSendingMessage,
    onSendMessage,
    onBackToList,
    onLoadMoreMessages,
    isFullScreen = false
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Get channel display info
    const getChannelDisplayInfo = () => {
        if (!activeChannel) return null;

        if (activeChannel.name) {
            return {
                name: activeChannel.name,
                subtitle: `${activeChannel.members.length} members`,
                avatar: null,
                isOnline: false
            };
        }

        // For direct messages, show other user's info
        if (activeChannel.type === 'direct' && activeChannel.members.length === 2) {
            const otherMember = activeChannel.members.find(m => m.user.id !== currentUserId);
            if (otherMember) {
                return {
                    name: otherMember.user.name,
                    subtitle: '', // Remove subtitle entirely
                    avatar: otherMember.user.image,
                    isOnline: otherMember.user.isOnline
                };
            }
        }

        return {
            name: 'Unknown Channel',
            subtitle: '',
            avatar: null,
            isOnline: false
        };
    };

    // Handle scroll to load more messages
    const handleScroll = () => {
        if (!messagesContainerRef.current || !onLoadMoreMessages) return;

        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop === 0 && !isLoadingMessages) {
            onLoadMoreMessages();
        }
    };

    const channelInfo = getChannelDisplayInfo();

    // Empty state when no channel selected
    if (!activeChannel) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                <div className="text-center">
                    <i className="bi bi-chat-dots text-muted mb-3 d-block" style={{ fontSize: '4rem' }}></i>
                    <h5 className="text-muted">Select a conversation</h5>
                    <p className="text-muted mb-0">Choose a conversation from the sidebar to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column h-100 bg-white">
            {/* Chat Header */}
            <div className="bg-white border-bottom p-3">
                <div className="d-flex align-items-center">
                    {/* Back Button for Mobile */}
                    {onBackToList && (
                        <button
                            className="btn btn-link p-0 me-3 d-md-none"
                            onClick={onBackToList}
                            title="Back to conversations"
                        >
                            <i className="bi bi-arrow-left fs-4"></i>
                        </button>
                    )}

                    {/* User Avatar */}
                    <div className="position-relative me-3">
                        <div
                            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                        >
                            {channelInfo?.avatar ? (
                                <img
                                    src={channelInfo.avatar}
                                    alt={channelInfo.name}
                                    className="rounded-circle"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML =
                                            `<span>${channelInfo?.name.charAt(0).toUpperCase()}</span>`;
                                    }}
                                />
                            ) : (
                                <span>{channelInfo?.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        {/* Online indicator */}
                        {channelInfo?.isOnline && (
                            <span
                                className="position-absolute bg-success rounded-circle border border-2 border-white"
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    bottom: '0',
                                    right: '0'
                                }}
                            ></span>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-grow-1">
                        <h6 className="mb-0">{channelInfo?.name}</h6>
                        {channelInfo?.isOnline && (
                            <small className="text-success">Online</small>
                        )}
                    </div>

                    {/* Removed Action Buttons */}
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-grow-1 overflow-auto p-2"
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{
                    height: isFullScreen ? 'calc(100vh - 160px)' : '400px'
                }}
            >
                {/* Load More Messages Indicator */}
                {isLoadingMessages && (
                    <div className="d-flex justify-content-center align-items-center mb-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading messages...</span>
                        </div>
                        <span className="ms-2 text-muted">Loading messages...</span>
                    </div>
                )}

                {/* Messages */}
                {messages.length > 0 ? (
                    <div>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>
                ) : !isLoadingMessages && (
                    /* Empty State */
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                        <i className="bi bi-chat-dots text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="text-muted">No messages yet</h5>
                        <p className="text-muted mb-0">Start the conversation by sending a message below</p>
                    </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
                onSendMessage={onSendMessage}
                disabled={isSendingMessage}
                placeholder={`Message ${channelInfo?.name}...`}
            />
        </div>
    );
};

export default ChatWindow;