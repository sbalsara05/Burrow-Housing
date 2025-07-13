import React, { useState, useEffect } from 'react';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { useChatService } from '../../../hooks/useChatService';
import { Channel } from '../../../types/chat';

const DashboardChatMain = () => {
    const [isMobileView, setIsMobileView] = useState(false);

    const {
        channels,
        activeChannel,
        messages,
        user,
        isLoadingChannels,
        isLoadingMessages,
        isSendingMessage,
        setActiveChannel,
        sendMessage,
        loadMoreMessages,
        error,
        clearError
    } = useChatService();

    // Handle responsive layout
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleChannelSelect = (channel: Channel) => {
        setActiveChannel(channel);
        if (error) clearError();
    };

    const handleBackToList = () => {
        setActiveChannel(null);
    };

    const handleCreateChannel = () => {
        // TODO: Implement channel creation modal/functionality
        console.log('Create channel clicked');
    };

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Chat" />
                
                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show tw-mb-4 tw-rounded-lg">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={clearError}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {/* Chat Interface - Mix Bootstrap grid with Tailwind styling */}
                <div className="bg-white card-box border-20 tw-shadow-lg tw-overflow-hidden">
                    <div className="chat-container tw-h-[70vh] tw-min-h-[500px] tw-max-h-[800px]">
                        <div className="row g-0 h-100">
                            {/* Chat List - Left Sidebar */}
                            <div className={`col-lg-4 col-md-5 ${activeChannel && isMobileView ? 'd-none' : ''}`}>
                                <div className="chat-list-wrapper tw-bg-gray-50 tw-h-full tw-border-r tw-border-gray-200">
                                    <ChatList
                                        channels={channels}
                                        activeChannel={activeChannel}
                                        onChannelSelect={handleChannelSelect}
                                        onCreateChannel={handleCreateChannel}
                                        isLoading={isLoadingChannels}
                                    />
                                </div>
                            </div>

                            {/* Chat Window - Main Content */}
                            <div className={`col-lg-8 col-md-7 ${!activeChannel && isMobileView ? 'd-none' : ''}`}>
                                <div className="chat-window-wrapper tw-h-full tw-bg-white">
                                    <ChatWindow
                                        activeChannel={activeChannel}
                                        messages={messages}
                                        currentUserId={user?.id || ''}
                                        isLoadingMessages={isLoadingMessages}
                                        isSendingMessage={isSendingMessage}
                                        onSendMessage={sendMessage}
                                        onBackToList={isMobileView ? handleBackToList : undefined}
                                        onLoadMoreMessages={loadMoreMessages}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardChatMain;