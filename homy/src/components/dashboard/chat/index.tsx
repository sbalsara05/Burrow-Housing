import { useState, useEffect, useRef } from "react";
import DashboardHeaderOne from "../../../layouts/headers/dashboard/DashboardHeaderOne";
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import ChatProvider from './ChatProvider'; // Import our provider
import { Channel, ChannelList, Window, MessageList, MessageInput, Thread } from 'stream-chat-react';
import CustomChannelHeader from './CustomChannelHeader';
import CustomEmptyStateIndicator from './CustomEmptyStateIndicator';
import CustomLoadingComponent from './CustomLoadingComponent';
// Import the default Stream Chat CSS for styling
import 'stream-chat-react/dist/css/v2/index.css';

// This component now renders the entire UI for the chat dashboard.
const ChatUIComponent = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const testElementRef = useRef<HTMLDivElement>(null);

    // #region agent log
    useEffect(() => {
        if (testElementRef.current) {
            const computedStyle = window.getComputedStyle(testElementRef.current);
            const hasRounded = computedStyle.borderRadius !== '0px' && computedStyle.borderRadius !== '';
            const hasOverflow = computedStyle.overflow !== 'visible';
            const hasHeight = computedStyle.height !== 'auto' && computedStyle.height !== '';
            fetch('http://127.0.0.1:7242/ingest/598e45a1-6f56-4409-92f2-4182ed39f6fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/index.tsx:30',message:'Tailwind class check',data:{twRoundedLg:hasRounded,twOverflowHidden:hasOverflow,twHApplied:hasHeight,computedBorderRadius:computedStyle.borderRadius,computedOverflow:computedStyle.overflow,computedHeight:computedStyle.height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
    }, []);
    // #endregion

    const toggleSidebar = () => {
        setIsSidebarVisible(prev => !prev);
    };
    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Chat" />
                <div ref={testElementRef} className="bg-white card-box p-0 border-20 tw-rounded-lg tw-overflow-hidden">
                    <div className="tw-h-[75vh] tw-min-h-[600px] tw-max-h-[850px]">
                        <div className="tw-flex tw-h-full burrow-chat-container">
                            <div className={`burrow-chat-sidebar ${isSidebarVisible ? 'visible' : ''}`}>
                                <ChannelList />
                            </div>

                            <div className="burrow-chat-main">
                                <Channel
                                    EmptyStateIndicator={CustomEmptyStateIndicator}
                                    LoadingIndicator={CustomLoadingComponent}
                                >
                                    <Window>
                                        <CustomChannelHeader toggleSidebar={toggleSidebar} />
                                        <MessageList />
                                        <MessageInput />
                                    </Window>
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