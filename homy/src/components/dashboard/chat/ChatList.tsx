import { useState, useEffect } from 'react';

interface ChatListProps {
    activeChat: string | null;
    setActiveChat: (chatId: string | null) => void;
    setIsMobileView: (isMobile: boolean) => void;
}

interface ChatItem {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isOnline: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
    activeChat,
    setActiveChat,
    setIsMobileView
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [chats, setChats] = useState<ChatItem[]>([]);

    // Mock data - replace with real data from your API
    useEffect(() => {
        const mockChats: ChatItem[] = [
            {
                id: '1',
                name: 'John Doe',
                avatar: '/images/lazy.svg',
                lastMessage: 'Hey, are you available for a property viewing?',
                timestamp: '2m ago',
                unreadCount: 2,
                isOnline: true
            },
            {
                id: '2',
                name: 'Sarah Wilson',
                avatar: '/images/lazy.svg',
                lastMessage: 'Thank you for the property details',
                timestamp: '1h ago',
                unreadCount: 0,
                isOnline: false
            },
            {
                id: '3',
                name: 'Mike Johnson',
                avatar: '/images/lazy.svg',
                lastMessage: 'Is the property still available?',
                timestamp: '3h ago',
                unreadCount: 1,
                isOnline: true
            }
        ];
        setChats(mockChats);
    }, []);

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChatSelect = (chatId: string) => {
        setActiveChat(chatId);
        setIsMobileView(true);
    };

    return (
        <div className="chat-list-container">
            {/* Search Bar */}
            <div className="search-bar p-3 border-bottom">
                <div className="position-relative">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                </div>
            </div>

            {/* Chat List */}
            <div className="chat-list overflow-auto" style={{ maxHeight: '500px' }}>
                {filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`chat-item d-flex align-items-center p-3 cursor-pointer border-bottom hover-bg-light ${activeChat === chat.id ? 'bg-primary-light' : ''
                            }`}
                        onClick={() => handleChatSelect(chat.id)}
                    >
                        {/* Avatar */}
                        <div className="position-relative me-3">
                            <img
                                src={chat.avatar}
                                alt={chat.name}
                                className="rounded-circle"
                                width="50"
                                height="50"
                            />
                            {chat.isOnline && (
                                <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white"
                                    style={{ width: '12px', height: '12px' }}></span>
                            )}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                                <h6 className="mb-0 text-truncate">{chat.name}</h6>
                                <small className="text-muted">{chat.timestamp}</small>
                            </div>
                            <p className="mb-0 text-muted small text-truncate">
                                {chat.lastMessage}
                            </p>
                        </div>

                        {/* Unread Count */}
                        {chat.unreadCount > 0 && (
                            <div className="ms-2">
                                <span className="badge bg-primary rounded-pill">
                                    {chat.unreadCount}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;