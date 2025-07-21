// src/components/dashboard/chat/conversation/index.tsx - Updated Conversation Component
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeaderOne from "../../../../layouts/headers/dashboard/DashboardHeaderOne";

const DashboardChatConversationMain = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const {
        channels,
        activeChannel,
        messages,
        user,
        isLoadingMessages,
        isSendingMessage,
        setActiveChannel,
        sendMessage,
        loadMoreMessages,
        error
    } = useChatService();

    // Load specific conversation
    useEffect(() => {
        const loadConversation = async () => {
            if (!id) {
                navigate('/dashboard/chat');
                return;
            }

            try {
                setIsLoading(true);
                
                // Find the channel by ID
                const channel = channels.find(c => c.id === id);
                
                if (channel) {
                    setActiveChannel(channel);
                } else {
                    // Channel not found, redirect to main chat
                    navigate('/dashboard/chat');
                }
            } catch (error) {
                console.error('Failed to load conversation:', error);
                navigate('/dashboard/chat');
            } finally {
                setIsLoading(false);
            }
        };

        if (channels.length > 0) {
            loadConversation();
        }
    }, [id, channels, navigate, setActiveChannel]);

    const handleBackToChat = () => {
        navigate('/dashboard/chat');
    };

    // Loading state
    if (isLoading || channels.length === 0) {
        return (
            <div className="dashboard-body">
                <div className="position-relative">
                    <DashboardHeaderOne />
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading conversation...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Channel not found
    if (!activeChannel) {
        return (
            <div className="dashboard-body">
                <div className="position-relative">
                    <DashboardHeaderOne />
                    <div className="bg-white card-box border-20 text-center p-5">
                        <i className="bi bi-chat-x fs-1 text-muted mb-3"></i>
                        <h5 className="mb-3">Conversation not found</h5>
                        <p className="text-muted mb-4">
                            The conversation you're looking for doesn't exist or has been deleted.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={handleBackToChat}
                        >
                            Back to Chat
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Get channel display name
    const getChannelDisplayName = () => {
        if (activeChannel.name) return activeChannel.name;
        
        if (activeChannel.type === 'direct' && activeChannel.members.length === 2) {
            const otherMember = activeChannel.members.find(m => m.user.id !== user?.id);
            return otherMember?.user.name || 'Unknown User';
        }
        
        return 'Conversation';
    };

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                {/* Header with Back Button */}
                <div className="d-flex align-items-center mb-4">
                    <button
                        className="btn btn-link p-0 me-3"
                        onClick={handleBackToChat}
                    >
                        <i className="bi bi-arrow-left fs-4"></i>
                    </button>
                    <div className="flex-grow-1">
                        <DashboardHeaderOne />
                    </div>
                </div>

                <h2 className="main-title d-block d-lg-none">
                    {getChannelDisplayName()}
                </h2>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}

                {/* Full Screen Chat Window */}
                <div className="bg-white card-box border-20">
                    <ChatWindow
                        activeChannel={activeChannel}
                        messages={messages}
                        currentUser={user}
                        isLoadingMessages={isLoadingMessages}
                        isSendingMessage={isSendingMessage}
                        onSendMessage={sendMessage}
                        onLoadMoreMessages={loadMoreMessages}
                        isFullScreen={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardChatConversationMain;