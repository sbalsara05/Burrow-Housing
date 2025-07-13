// src/hooks/useChatService.ts - Simplified version without file uploads
import { useState, useEffect, useCallback } from 'react';
import {
    User,
    Message,
    Channel,
    SendMessageRequest,
    CreateChannelRequest,
    GetMessagesRequest
} from '../types/chat';
import { chatService } from '../services/chatServiceFactory';

interface UseChatServiceReturn {
    // Connection state
    isConnected: boolean;
    isConnecting: boolean;
    user: User | null;

    // Channels
    channels: Channel[];
    activeChannel: Channel | null;

    // Messages
    messages: Message[];

    // Loading states
    isLoadingChannels: boolean;
    isLoadingMessages: boolean;
    isSendingMessage: boolean;

    // Actions
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    setActiveChannel: (channel: Channel | null) => void;
    sendMessage: (text: string) => Promise<void>;
    markAsRead: () => Promise<void>;
    createChannel: (members: string[], name?: string, description?: string) => Promise<Channel>;
    searchUsers: (query: string) => Promise<User[]>;
    loadMoreMessages: () => Promise<void>;
    refreshChannels: () => Promise<void>;

    // Error handling
    error: string | null;
    clearError: () => void;
}

export const useChatService = (): UseChatServiceReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingChannels, setIsLoadingChannels] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Connect to chat service
    const connect = useCallback(async () => {
        try {
            setIsConnecting(true);
            setError(null);

            // Get current user
            const userResponse = await chatService.getCurrentUser();
            if (userResponse.success) {
                setUser(userResponse.data);
                setIsConnected(true);

                // Load channels after connection
                await loadChannels();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect');
            console.error('Connection error:', err);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // Disconnect from chat service
    const disconnect = useCallback(async () => {
        try {
            // Update user status to offline
            if (user) {
                await chatService.updateUserStatus(false);
            }

            setIsConnected(false);
            setUser(null);
            setChannels([]);
            setActiveChannel(null);
            setMessages([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to disconnect');
            console.error('Disconnect error:', err);
        }
    }, [user]);

    // Load user channels
    const loadChannels = useCallback(async () => {
        try {
            setIsLoadingChannels(true);
            setError(null);

            const response = await chatService.getChannels();
            if (response.success) {
                setChannels(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load channels');
            console.error('Load channels error:', err);
        } finally {
            setIsLoadingChannels(false);
        }
    }, []);

    // Refresh channels
    const refreshChannels = useCallback(async () => {
        await loadChannels();
    }, [loadChannels]);

    // Set active channel and load messages
    const handleSetActiveChannel = useCallback((channel: Channel | null) => {
        setActiveChannel(channel);
        if (channel) {
            loadChannelMessages(channel.id);
        } else {
            setMessages([]);
        }
    }, []);

    // Load messages for a channel
    const loadChannelMessages = useCallback(async (channelId: string) => {
        try {
            setIsLoadingMessages(true);
            setError(null);

            const request: GetMessagesRequest = {
                channelId,
                limit: 50
            };

            const response = await chatService.getMessages(request);
            if (response.success) {
                setMessages(response.data);

                // Mark channel as read
                await chatService.markChannelAsRead(channelId);

                // Update local channel unread count
                setChannels(prev => prev.map(ch =>
                    ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
                ));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load messages');
            console.error('Load messages error:', err);
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    // Send a message - SIMPLIFIED (no file attachments)
    const sendMessage = useCallback(async (text: string) => {
        if (!activeChannel || !text.trim()) return;

        try {
            setIsSendingMessage(true);
            setError(null);

            const request: SendMessageRequest = {
                channelId: activeChannel.id,
                text: text.trim()
                // Removed attachments parameter
            };

            const response = await chatService.sendMessage(request);
            if (response.success) {
                // Add message to local state
                setMessages(prev => [...prev, response.data]);

                // Update channel's last message
                setChannels(prev => prev.map(ch =>
                    ch.id === activeChannel.id
                        ? { ...ch, lastMessage: response.data, updatedAt: response.data.timestamp }
                        : ch
                ));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message');
            console.error('Send message error:', err);
        } finally {
            setIsSendingMessage(false);
        }
    }, [activeChannel]);

    // Mark channel as read
    const markAsRead = useCallback(async () => {
        if (!activeChannel) return;

        try {
            await chatService.markChannelAsRead(activeChannel.id);

            // Update local channel unread count
            setChannels(prev => prev.map(ch =>
                ch.id === activeChannel.id ? { ...ch, unreadCount: 0 } : ch
            ));
        } catch (err) {
            console.error('Mark as read error:', err);
        }
    }, [activeChannel]);

    // Create new channel
    const createChannel = useCallback(async (
        members: string[],
        name?: string,
        description?: string
    ): Promise<Channel> => {
        try {
            setError(null);

            const request: CreateChannelRequest = {
                type: members.length > 1 ? 'group' : 'direct',
                members: [...members, user?.id].filter(Boolean) as string[],
                name,
                description
            };

            const response = await chatService.createChannel(request);
            if (response.success) {
                // Add channel to local state
                setChannels(prev => [response.data, ...prev]);
                return response.data;
            }

            throw new Error('Failed to create channel');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create channel');
            console.error('Create channel error:', err);
            throw err;
        }
    }, [user]);

    // Search users
    const searchUsers = useCallback(async (query: string): Promise<User[]> => {
        try {
            setError(null);
            const response = await chatService.searchUsers(query);

            if (response.success) {
                return response.data;
            }

            return [];
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search users');
            console.error('Search users error:', err);
            return [];
        }
    }, []);

    // Load more messages (pagination)
    const loadMoreMessages = useCallback(async () => {
        if (!activeChannel || isLoadingMessages || messages.length === 0) return;

        try {
            setError(null);

            const request: GetMessagesRequest = {
                channelId: activeChannel.id,
                limit: 20,
                before: messages[0]?.id
            };

            const response = await chatService.getMessages(request);
            if (response.success && response.data.length > 0) {
                setMessages(prev => [...response.data, ...prev]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more messages');
            console.error('Load more messages error:', err);
        }
    }, [activeChannel, isLoadingMessages, messages]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto-connect on mount
    useEffect(() => {
        connect();

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, []);

    return {
        // Connection state
        isConnected,
        isConnecting,
        user,

        // Channels
        channels,
        activeChannel,

        // Messages
        messages,

        // Loading states
        isLoadingChannels,
        isLoadingMessages,
        isSendingMessage,

        // Actions
        connect,
        disconnect,
        setActiveChannel: handleSetActiveChannel,
        sendMessage,
        markAsRead,
        createChannel,
        searchUsers,
        loadMoreMessages,
        refreshChannels,

        // Error handling
        error,
        clearError
    };
};

export default useChatService;