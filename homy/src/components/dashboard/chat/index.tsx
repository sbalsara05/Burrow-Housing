import { useState } from 'react';
import DashboardHeaderOne from "../../../layouts/headers/dashboard/DashboardHeaderOne"
import ChatBody from './ChatBody';

const DashboardChatMain = () => {
    const [activeChat, setActiveChat] = useState<string | null>(null);

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderOne title="Chat" />
                <h2 className="main-title d-block d-lg-none">Chat</h2>
                <ChatBody
                    activeChat={activeChat}
                    setActiveChat={setActiveChat}
                />
            </div>
        </div>
    );
};

export default DashboardChatMain;