import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardHeaderOne from "../../../layouts/headers/dashboard/DashboardHeaderOne";
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import ChatProvider from './ChatProvider'; // Import our provider
import { Channel, ChannelList, Window, MessageList, MessageInput, Thread, useChatContext, useChannelStateContext } from 'stream-chat-react';
import CustomChannelHeader from './CustomChannelHeader';
import CustomEmptyStateIndicator from './CustomEmptyStateIndicator';
import CustomLoadingComponent from './CustomLoadingComponent';
import { useSidebarCollapse } from '../../../hooks/useSidebarCollapse';
// Import the default Stream Chat CSS for styling
import 'stream-chat-react/dist/css/v2/index.css';

// Empty state component for ChannelList
const EmptyChannelList = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center p-4 h-100">
            <div className="mb-3">
                <i className="fa-regular fa-comments" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            </div>
            <p className="text-muted text-center mb-0">No conversations yet</p>
        </div>
    );
};

// Component to show when no channel is selected
const NoChannelSelected = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-5" style={{ minHeight: '400px' }}>
            <div className="mb-4">
                <i className="fa-regular fa-comments" style={{ fontSize: '4rem', color: '#ccc' }}></i>
            </div>
            <h4 className="mb-2">No chats yet</h4>
            <p className="text-muted text-center">
                When you approve an interest request, a chat will be created here.
            </p>
        </div>
    );
};

// Component that wraps Channel to detect if it's active
const ChannelWrapper = ({ toggleSidebar, channelId }: { toggleSidebar: () => void; channelId?: string | null }) => {
    const { client } = useChatContext();
    const [channel, setChannel] = useState<any>(null);
    const [showEmptyState, setShowEmptyState] = useState(false); // Start as false, only show if confirmed no channels
    const [hasChannels, setHasChannels] = useState<boolean | null>(null); // null = checking, true/false = result

    useEffect(() => {
        // Check if user has any channels first
        const checkForChannels = async () => {
            if (!client || !client.userID) {
                setHasChannels(false);
                return;
            }
            
            try {
                const filter = { members: { $in: [client.userID] } };
                const sort = { last_message_at: -1 };
                const channels = await client.queryChannels(filter, sort, { limit: 1 });
                const hasAnyChannels = channels.length > 0;
                setHasChannels(hasAnyChannels);
                
                if (!hasAnyChannels) {
                    // No channels exist - show empty state
                    setShowEmptyState(true);
                } else {
                    // Channels exist - wait for one to be selected, don't show empty state yet
                    setShowEmptyState(false);
                    
                    // Try to auto-select first channel if none selected after a delay
                    setTimeout(() => {
                        const channelHeader = document.querySelector('.burrow-chat-main .str-chat__channel-header, .burrow-chat-main .burrow-chat-header-container');
                        if (!channelHeader) {
                            // No channel selected, try clicking first one
                            const firstChannel = document.querySelector('.str-chat__channel-list .str-chat__channel-preview, .str-chat__channel-list-messenger .str-chat__channel-preview-messenger');
                            if (firstChannel) {
                                (firstChannel as HTMLElement).click();
                            }
                        }
                    }, 500);
                }
            } catch (error) {
                console.error('Error checking channels:', error);
                setHasChannels(false);
                setShowEmptyState(true);
            }
        };

        // If channelId is provided from URL, create and watch the channel
        if (channelId && client) {
            const loadChannel = async () => {
                try {
                    const channelInstance = client.channel('messaging', channelId);
                    await channelInstance.watch();
                    setChannel(channelInstance);
                    setShowEmptyState(false);
                } catch (error) {
                    console.error('Error loading channel:', error);
                }
            };
            loadChannel();
        } else {
            checkForChannels();
            
            // Monitor for channel selection
            const checkChannel = () => {
                const channelHeader = document.querySelector('.burrow-chat-main .str-chat__channel-header, .burrow-chat-main .burrow-chat-header-container');
                const messageList = document.querySelector('.burrow-chat-main .str-chat__message-list');
                const messageInput = document.querySelector('.burrow-chat-main .str-chat__input-flat, .burrow-chat-main .str-chat__message-input');
                
                const hasActiveChannel = !!(channelHeader || messageList || messageInput);
                
                if (hasActiveChannel) {
                    setShowEmptyState(false);
                } else if (hasChannels === false) {
                    // Only show empty state if we've confirmed no channels exist
                    setShowEmptyState(true);
                }
            };

            // Check periodically
            const interval = setInterval(checkChannel, 200);
            
            const observer = new MutationObserver(checkChannel);
            const container = document.querySelector('.burrow-chat-main');
            if (container) {
                observer.observe(container, { 
                    childList: true, 
                    subtree: true,
                    attributes: true
                });
            }

            return () => {
                clearInterval(interval);
                observer.disconnect();
            };
        }
    }, [channelId, client, hasChannels]);

    // If we have a specific channel from URL, use it
    if (channel) {
        return (
            <Channel
                channel={channel}
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
        );
    }

    // Otherwise, use default Channel component (selects from ChannelList)
    // Use a wrapper component inside Channel to detect channel state
    return (
        <>
            <Channel
                EmptyStateIndicator={CustomEmptyStateIndicator}
                LoadingIndicator={CustomLoadingComponent}
            >
                <ChannelContentWrapper 
                    toggleSidebar={toggleSidebar} 
                    setShowEmptyState={setShowEmptyState}
                />
                <Thread />
            </Channel>
            {showEmptyState && (
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0,
                    backgroundColor: 'white',
                    zIndex: 5
                }}>
                    <NoChannelSelected />
                </div>
            )}
        </>
    );
};

// Component that renders channel content and detects if channel is active
// Must be inside Channel component to use useChannelStateContext
const ChannelContentWrapper = ({ 
    toggleSidebar, 
    setShowEmptyState 
}: { 
    toggleSidebar: () => void; 
    setShowEmptyState: (show: boolean) => void;
}) => {
    try {
        const { channel } = useChannelStateContext();
        
        useEffect(() => {
            // If channel exists, hide empty state
            if (channel) {
                setShowEmptyState(false);
            } else {
                // Wait a bit before showing empty state (channel might be loading)
                const timeout = setTimeout(() => {
                    setShowEmptyState(true);
                }, 500);
                return () => clearTimeout(timeout);
            }
        }, [channel, setShowEmptyState]);

        return (
            <Window>
                <CustomChannelHeader toggleSidebar={toggleSidebar} />
                <MessageList />
                <MessageInput />
            </Window>
        );
    } catch (error) {
        // If useChannelStateContext fails, it means no channel is selected
        useEffect(() => {
            const timeout = setTimeout(() => {
                setShowEmptyState(true);
            }, 500);
            return () => clearTimeout(timeout);
        }, [setShowEmptyState]);
        
        return null;
    }
};

// This component now renders the entire UI for the chat dashboard.
const ChatUIComponent = () => {
    const [searchParams] = useSearchParams();
    const channelIdFromUrl = searchParams.get('channel');
    const { client } = useChatContext();
    const isCollapsed = useSidebarCollapse();

    const toggleSidebar = () => {
        // Sidebar toggle for mobile (if needed)
    };

    // Filter to only show channels where the current user is a member
    const channelFilters = client?.userID ? {
        members: { $in: [client.userID] }
    } : undefined;

    return (
        <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="position-relative">
                <DashboardHeaderTwo title="Chat" />
                <div className="bg-white card-box p-0 border-20 tw-rounded-lg tw-overflow-hidden">
                    <div className="tw-h-[75vh] tw-min-h-[600px] tw-max-h-[850px]">
                        <div className="tw-flex tw-h-full burrow-chat-container" style={{ height: '100%' }}>
                            {/* Chat Sidebar - List of conversations (like iMessage) */}
                            <div className="burrow-chat-sidebar" style={{ 
                                width: '320px', 
                                minWidth: '320px',
                                maxWidth: '320px',
                                borderRight: '1px solid #e9e9e9',
                                backgroundColor: '#f8f9fa',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                position: 'relative',
                                transform: 'none',
                                boxShadow: 'none'
                            }}>
                                <ChannelList 
                                    filters={channelFilters}
                                    EmptyStateIndicator={EmptyChannelList}
                                />
                            </div>

                            {/* Main Chat Area */}
                            <div className="burrow-chat-main" style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                                <ChannelWrapper toggleSidebar={toggleSidebar} channelId={channelIdFromUrl} />
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
            <ChatProvider>
                <ChatUIComponent />
            </ChatProvider>
        </>
    );
};

export default DashboardChatMain;