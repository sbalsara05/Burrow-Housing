import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
    activeChat: string | null;
    setActiveChat: (chatId: string | null) => void;
    setIsMobileView: (isMobile: boolean) => void;
}

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

interface ChatUser {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    activeChat,
    setActiveChat,
    setIsMobileView
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatUser, setChatUser] = useState<ChatUser | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock data - replace with real data from your API
    useEffect(() => {
        if (activeChat) {
            // Mock chat user data
            const mockUser: ChatUser = {
                id: activeChat,
                name: activeChat === '1' ? 'John Doe' : activeChat === '2' ? 'Sarah Wilson' : 'Mike Johnson',
                avatar: '/images/lazy.svg',
                isOnline: activeChat === '1' || activeChat === '3',
                lastSeen: activeChat === '2' ? '2 hours ago' : undefined
            };
            setChatUser(mockUser);

            // Mock messages
            const mockMessages: Message[] = [
                {
                    id: '1',
                    senderId: activeChat,
                    senderName: mockUser.name,
                    message: 'Hi! I\'m interested in the property listing.',
                    timestamp: '10:30 AM',
                    isCurrentUser: false,
                    type: 'text'
                },
                {
                    id: '2',
                    senderId: 'current-user',
                    senderName: 'You',
                    message: 'Great! I\'d be happy to help you with that.',
                    timestamp: '10:32 AM',
                    isCurrentUser: true,
                    type: 'text'
                },
                {
                    id: '3',
                    senderId: activeChat,
                    senderName: mockUser.name,
                    message: 'Can you tell me more about the location?',
                    timestamp: '10:35 AM',
                    isCurrentUser: false,
                    type: 'text'
                }
            ];
            setMessages(mockMessages);
        }
    }, [activeChat]);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (message: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: 'current-user',
            senderName: 'You',
            message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCurrentUser: true,
            type,
            fileUrl,
            fileName
        };

        setMessages(prev => [...prev, newMessage]);

        // Simulate typing indicator and response
        if (type === 'text') {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                // Add a mock response
                const response: Message = {
                    id: (Date.now() + 1).toString(),
                    senderId: activeChat!,
                    senderName: chatUser?.name || 'User',
                    message: 'Thank you for your message. I\'ll get back to you soon.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isCurrentUser: false,
                    type: 'text'
                };
                setMessages(prev => [...prev, response]);
            }, 2000);
        }
    };

    const handleBackToList = () => {
        setActiveChat(null);
        setIsMobileView(false);
    };

    if (!activeChat) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                    <i className="bi bi-chat-dots fs-1 text-muted mb-3"></i>
                    <h5 className="text-muted">Select a conversation to start messaging</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window d-flex flex-column h-100">
            {/* Chat Header */}
            <div className="chat-header d-flex align-items-center p-3 border-bottom">
                <button
                    className="btn btn-link d-md-none me-2 p-0"
                    onClick={handleBackToList}
                >
                    <i className="bi bi-arrow-left fs-5"></i>
                </button>

                <div className="d-flex align-items-center flex-grow-1">
                    <div className="position-relative me-3">
                        <img
                            src={chatUser?.avatar}
                            alt={chatUser?.name}
                            className="rounded-circle"
                            width="40"
                            height="40"
                        />
                        {chatUser?.isOnline && (
                            <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white"
                                style={{ width: '10px', height: '10px' }}></span>
                        )}
                    </div>
                    <div>
                        <h6 className="mb-0">{chatUser?.name}</h6>
                        <small className="text-muted">
                            {chatUser?.isOnline ? 'Online' : `Last seen ${chatUser?.lastSeen}`}
                        </small>
                    </div>
                </div>

                <div className="chat-actions">
                    <button className="btn btn-link p-2">
                        <i className="bi bi-telephone"></i>
                    </button>
                    <button className="btn btn-link p-2">
                        <i className="bi bi-camera-video"></i>
                    </button>
                    <button className="btn btn-link p-2">
                        <i className="bi bi-three-dots-vertical"></i>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area flex-grow-1 overflow-auto p-3" style={{ maxHeight: '400px' }}>
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-area border-top">
                <MessageInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default ChatWindow;