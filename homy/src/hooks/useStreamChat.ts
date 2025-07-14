import { useState, useEffect, useCallback } from 'react';
import { Channel, User, Message } from 'stream-chat';
import {
    chatClient,
    connectUser,
    disconnectUser,
    getUserChannels,
    createChannel,
    sendMessage,
    uploadFile,
    markChannelAsRead,
    searchUsers
} from '../lib/streamChat';

interface UseStreamChatReturn {
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

    // Actions
    connect: (userData: { id: string; name: string; image?: string; email?: string }) => Promise<void>;
    disconnect: () => Promise<void>;
    setActiveChannel: (channel: Channel | null) => void;
    sendNewMessage: (text: string, attachments?: any[]) => Promise<void>;
    uploadFileMessage: (file: File) => Promise<void>;
    markAsRead: () => Promise<void>;
    createNewChannel: (members: string[], channelData?: any) => Promise<Channel>;
    searchUserList: (query: string) => Promise<User[]>;

    // Error handling
    error: string | null;
    clearError: () => void;
}

export const useStreamChat = (): UseStreamChatReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingChannels, setIsLoadingChannels] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Connect user to Stream Chat
    const connect = useCallback(async (userData: {
        id: string;
        name: string;
        image?: string;
        email?: string
    }) => {
        try {
            setIsConnecting(true);
            setError(null);

            const connectedUser = await connectUser(userData);
            setUser(connectedUser);
            setIsConnected(true);

            // Load user channels after connection
            await loadChannels();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect');
            console.error('Connection error:', err);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // Disconnect user
    const disconnect = useCallback(async () => {
        try {
            await disconnectUser();
            setIsConnected(false);
            setUser(null);
            setChannels([]);
            setActiveChannel(null);
            setMessages([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to disconnect');
            console.error('Disconnect error:', err);
        }
    }, []);

    // Load user channels
    const loadChannels = useCallback(async () => {
        try {
            setIsLoadingChannels(true);
            setError(null);

            const userChannels = await getUserChannels();
            setChannels(userChannels);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load channels');
            console.error('Load channels error:', err);
        } finally {
            setIsLoadingChannels(false);
        }
    }, []);

    // Set active channel and load messages
    const handleSetActiveChannel = useCallback((channel: Channel | null) => {
        setActiveChannel(channel);
        if (channel) {
            loadChannelMessages(channel);
        } else {
            setMessages([]);
        }
    }, []);

    // Load messages for a channel
    const loadChannelMessages = useCallback(async (channel: Channel) => {
        try {
            setIsLoadingMessages(true);
            setError(null);

            const state = await channel.watch();
            setMessages(state.messages || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load messages');
            console.error('Load messages error:', err);
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    // Send a new message
    const sendNewMessage = useCallback(async (text: string, attachments?: any[]) => {
        if (!activeChannel) return;

        try {
            setError(null);
            await sendMessage(activeChannel.id!, text, attachments);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message');
            console.error('Send message error:', err);
        }
    }, [activeChannel]);

    // Upload file and send as message
    const uploadFileMessage = useCallback(async (file: File) => {
        if (!activeChannel) return;

        try {
            setError(null);
            const uploadedFile = await uploadFile(file);

            const attachment = {
                type: file.type.startsWith('image/') ? 'image' : 'file',
                asset_url: uploadedFile,
                title: file.name,
                file_size: file.size
            };

            await sendMessage(activeChannel.id!, '', [attachment]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload file');
            console.error('Upload file error:', err);
        }
    }, [activeChannel]);

    // Mark channel as read
    const markAsRead = useCallback(async () => {
        if (!activeChannel) return;

        try {
            await markChannelAsRead(activeChannel.id!);
        } catch (err) {
            console.error('Mark as read error:', err);
        }
    }, [activeChannel]);

    // Create new channel
    const createNewChannel = useCallback(async (members: string[], channelData?: any) => {
        try {
            setError(null);
            const channel = await createChannel('messaging', undefined, members, channelData);
            await loadChannels(); // Refresh channels list
            return channel;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create channel');
            console.error('Create channel error:', err);
            throw err;
        }
    }, [loadChannels]);

    // Search users
    const searchUserList = useCallback(async (query: string) => {
        try {
            setError(null);
            return await searchUsers(query);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search users');
            console.error('Search users error:', err);
            return [];
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Set up real-time listeners
    useEffect(() => {
        if (!activeChannel) return;

        const handleNewMessage = (event: any) => {
            setMessages(prev => [...prev, event.message]);
        };

        const handleMessageUpdated = (event: any) => {
            setMessages(prev => prev.map(msg =>
                msg.id === event.message.id ? event.message : msg
            ));
        };

        const handleMessageDeleted = (event: any) => {
            setMessages(prev => prev.filter(msg => msg.id !== event.message.id));
        };

        activeChannel.on('message.new', handleNewMessage);
        activeChannel.on('message.updated', handleMessageUpdated);
        activeChannel.on('message.deleted', handleMessageDeleted);

        return () => {
            activeChannel.off('message.new', handleNewMessage);
            activeChannel.off('message.updated', handleMessageUpdated);
            activeChannel.off('message.deleted', handleMessageDeleted);
        };
    }, [activeChannel]);

    // Set up connection listeners
    useEffect(() => {
        const handleConnectionChanged = (event: any) => {
            setIsConnected(event.online);
        };

        chatClient.on('connection.changed', handleConnectionChanged);

        return () => {
            chatClient.off('connection.changed', handleConnectionChanged);
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

        // Actions
        connect,
        disconnect,
        setActiveChannel: handleSetActiveChannel,
        sendNewMessage,
        uploadFileMessage,
        markAsRead,
        createNewChannel,
        searchUserList,

        // Error handling
        error,
        clearError
    };
};

export default useStreamChat;