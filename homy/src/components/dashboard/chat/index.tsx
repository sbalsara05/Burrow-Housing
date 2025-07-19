import DashboardHeaderOne from "../../../layouts/headers/dashboard/DashboardHeaderOne";
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import ChatProvider from './ChatProvider'; // Import our provider
import { Channel, ChannelList, Window, MessageList, MessageInput, Thread } from 'stream-chat-react';

// Import the default Stream Chat CSS for styling
import 'stream-chat-react/dist/css/v2/index.css';
// custom CSS 
import "../../../../public/assets/css/custom-chat.css";

// This component now renders the entire UI for the chat dashboard.
const ChatUIComponent = () => {
    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Chat" />
                <div className="bg-white card-box p-0 border-20 tw-rounded-lg tw-overflow-hidden">
                    <div className="tw-h-[75vh] tw-min-h-[600px] tw-max-h-[850px]">
                        <div className="tw-flex tw-h-full">
                            {/* 
                                ChannelList: This component from the library automatically
                                fetches and displays the user's channels. It handles
                                clicks, unread counts, and real-time updates.
                            */}
                            <div className="tw-w-full md:tw-w-2/5 lg:tw-w-1/3 tw-border-r tw-border-gray-200">
                                <ChannelList />
                            </div>

                            {/* 
                                Channel: The main container for the active conversation.
                                It provides context for the components inside it.
                            */}
                            <div className="tw-w-full md:tw-w-3/5 lg:tw-w-2/3">
                                <Channel>
                                    {/* 
                                        Window: A wrapper providing the header for the active channel.
                                    */}
                                    <Window>
                                        {/* 
                                            MessageList: Automatically displays messages and handles pagination.
                                        */}
                                        <MessageList />
                                        {/* 
                                            MessageInput: A complete input component with file uploads,
                                            emojis, and sending logic.
                                        */}
                                        <MessageInput />
                                    </Window>
                                    {/* 
                                        Thread: Handles threaded replies. Only renders when a thread is active.
                                    */}
                                    <Thread />
                                </Channel>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// This is the main exported component for the page, which sets up the provider.
const DashboardChatMain = () => {
    return (
        <>
            <DashboardHeaderOne />
            <ChatProvider>
                <ChatUIComponent />
            </ChatProvider>
        </>
    );
};

export default DashboardChatMain;