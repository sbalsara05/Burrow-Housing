import React, { useState, useEffect } from 'react';
import DashboardHeaderOne from "../../../layouts/headers/dashboard/DashboardHeaderOne";
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { useChatService } from '../../../hooks/useChatService';

const DashboardChatMain = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);

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

    // Check if mobile view
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobileView(mobile);

            // On mobile, show chat list by default if no active channel
            if (mobile && !activeChannel) {
                setShowChatList(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [activeChannel]);

    const handleChannelSelect = (channel: any) => {
        setActiveChannel(channel);

        // On mobile, hide chat list when channel is selected
        if (isMobileView) {
            setShowChatList(false);
        }

        // Clear any existing errors
        if (error) {
            clearError();
        }
    };

    const handleBackToList = () => {
        setActiveChannel(null);
        setShowChatList(true);
    };

    const handleSendMessage = async (text: string) => {
        try {
            await sendMessage(text);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleCreateChannel = () => {
        // TODO: Implement channel creation
        console.log('Create channel clicked');
    };

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderOne title="Chat" />

                {/* Error Display */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show mx-3" role="alert">
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
                <div className="container-fluid p-0">
                    <div className="row g-0" style={{ height: 'calc(100vh - 100px)' }}>
                        {/* Chat List - Left Sidebar */}
                        <div className={`col-lg-4 col-md-5 border-end ${isMobileView ? (showChatList ? 'd-block' : 'd-none') : 'd-block'
                            }`}>
                            <ChatList
                                channels={channels}
                                activeChannel={activeChannel}
                                onChannelSelect={handleChannelSelect}
                                onCreateChannel={handleCreateChannel}
                                isLoading={isLoadingChannels}
                            />
                        </div>

                        {/* Chat Window - Main Content */}
                        <div className={`col-lg-8 col-md-7 ${isMobileView ? (showChatList ? 'd-none' : 'd-block') : 'd-block'
                            }`}>
                            <ChatWindow
                                activeChannel={activeChannel}
                                messages={messages}
                                currentUserId={user?.id || ''}
                                isLoadingMessages={isLoadingMessages}
                                isSendingMessage={isSendingMessage}
                                onSendMessage={handleSendMessage}
                                onBackToList={isMobileView ? handleBackToList : undefined}
                                onLoadMoreMessages={loadMoreMessages}
                                isFullScreen={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Development Status Indicator */}
                {/* {process.env.NODE_ENV === 'development' && (
                    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1000 }}>
                        <div className="badge bg-secondary">
                            <i className="bi bi-gear me-1"></i>
                            {import.meta.env.VITE_USE_MOCK_CHAT === 'true' ? 'Mock Data' : 'Live API'}
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default DashboardChatMain;