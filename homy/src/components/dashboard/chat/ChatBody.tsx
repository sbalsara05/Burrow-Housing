import { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

interface ChatBodyProps {
    activeChat: string | null;
    setActiveChat: (chatId: string | null) => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({ activeChat, setActiveChat }) => {
    const [isMobileView, setIsMobileView] = useState(false);

    return (
        <div className="bg-white card-box border-20">
            <div className="row">
                {/* Chat List - Left Sidebar */}
                <div className={`col-lg-4 col-md-5 ${activeChat && isMobileView ? 'd-none' : ''}`}>
                    <div className="chat-sidebar border-end h-100">
                        <div className="chat-header p-3 border-bottom">
                            <h4 className="mb-0">Messages</h4>
                        </div>
                        <ChatList
                            activeChat={activeChat}
                            setActiveChat={setActiveChat}
                            setIsMobileView={setIsMobileView}
                        />
                    </div>
                </div>

                {/* Chat Window - Main Content */}
                <div className={`col-lg-8 col-md-7 ${!activeChat && isMobileView ? 'd-none' : ''}`}>
                    <ChatWindow
                        activeChat={activeChat}
                        setActiveChat={setActiveChat}
                        setIsMobileView={setIsMobileView}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatBody;