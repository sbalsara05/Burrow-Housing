import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeaderOne from "../../../../layouts/headers/dashboard/DashboardHeaderOne";
import ChatWindow from '../ChatWindow';

interface ConversationUser {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
}

const DashboardChatConversationMain = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [conversationUser, setConversationUser] = useState<ConversationUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock data - replace with real API call
    useEffect(() => {
        const loadConversation = async () => {
            if (!id) {
                navigate('/dashboard/chat');
                return;
            }

            try {
                setIsLoading(true);

                // Mock API call - replace with actual API
                await new Promise(resolve => setTimeout(resolve, 500));

                const mockUser: ConversationUser = {
                    id: id,
                    name: id === '1' ? 'John Doe' : id === '2' ? 'Sarah Wilson' : 'Mike Johnson',
                    avatar: '/images/lazy.svg',
                    isOnline: id === '1' || id === '3',
                    lastSeen: id === '2' ? '2 hours ago' : undefined
                };

                setConversationUser(mockUser);
            } catch (error) {
                console.error('Failed to load conversation:', error);
                navigate('/dashboard/chat');
            } finally {
                setIsLoading(false);
            }
        };

        loadConversation();
    }, [id, navigate]);

    const handleBackToChat = () => {
        navigate('/dashboard/chat');
    };

    if (isLoading) {
        return (
            <div className="dashboard-body">
                <div className="position-relative">
                    <DashboardHeaderOne title="Chat" />
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

    if (!conversationUser) {
        return (
            <div className="dashboard-body">
                <div className="position-relative">
                    <DashboardHeaderOne title="Chat" />
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
                        <DashboardHeaderOne title={`Chat with ${conversationUser.name}`} />
                    </div>
                </div>

                <h2 className="main-title d-block d-lg-none">
                    {conversationUser.name}
                </h2>

                {/* Full Screen Chat Window */}
                <div className="bg-white card-box border-20">
                    <ChatWindow
                        activeChat={conversationUser.id}
                        setActiveChat={() => { }}
                        setIsMobileView={() => { }}
                        isFullScreen={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardChatConversationMain;