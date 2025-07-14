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

                {/* Chat Interface */}
                <div className="bg-white card-box p0 border-20 tw-rounded-lg tw-overflow-hidden">
                    <div className="tw-h-[70vh] tw-min-h-[500px] tw-max-h-[800px]">
                        <div className="tw-flex tw-h-full">
                            {/* Chat List - Left Sidebar */}
                            <div className={`tw-w-full md:tw-w-2/5 lg:tw-w-1/3 ${activeChannel && isMobileView ? 'tw-hidden' : ''}`}>
                                <div className="tw-bg-gray-50 tw-h-full tw-border-r tw-border-gray-200">
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
                            <div className={`tw-w-full md:tw-w-3/5 lg:tw-w-2/3 ${!activeChannel && isMobileView ? 'tw-hidden' : ''}`}>
                                <div className="tw-h-full tw-bg-white">
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