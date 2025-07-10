import React, { createContext, useContext, useEffect, useState } from 'react';
import { Chat } from 'stream-chat-react';
import { chatClient } from '../../lib/streamChat';
import { User } from 'stream-chat';

interface StreamChatContextType {
    client: typeof chatClient;
    user: User | null;
    isConnected: boolean;
    connect: (userData: { id: string; name: string; image?: string; email?: string }) => Promise<void>;
    disconnect: () => Promise<void>;
}

const StreamChatContext = createContext<StreamChatContextType | undefined>(undefined);

interface StreamChatProviderProps {
    children: React.ReactNode;
    theme?: 'light' | 'dark';
}

export const StreamChatProvider: React.FC<StreamChatProviderProps> = ({
    children,
    theme = 'light'
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Connect user to Stream Chat
    const connect = async (userData: {
        id: string;
        name: string;
        image?: string;
        email?: string
    }) => {
        try {
            // In production, get the token from your backend
            const token = chatClient.devToken(userData.id);

            const connectedUser = await chatClient.connectUser(userData, token);
            setUser(connectedUser);
            setIsConnected(true);

            console.log('User connected to Stream Chat:', userData.name);
        } catch (error) {
            console.error('Failed to connect user:', error);
            throw error;
        }
    };

    // Disconnect user
    const disconnect = async () => {
        try {
            await chatClient.disconnectUser();
            setUser(null);
            setIsConnected(false);
            console.log('User disconnected from Stream Chat');
        } catch (error) {
            console.error('Failed to disconnect user:', error);
            throw error;
        }
    };

    // Initialize Stream Chat client
    useEffect(() => {
        const initializeClient = async () => {
            try {
                // Check if user is already connected
                if (chatClient.user) {
                    setUser(chatClient.user);
                    setIsConnected(true);
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize Stream Chat client:', error);
                setIsInitialized(true);
            }
        };

        initializeClient();
    }, []);

    // Set up connection listeners
    useEffect(() => {
        const handleConnectionChanged = (event: any) => {
            setIsConnected(event.online);
        };

        const handleUserUpdated = (event: any) => {
            setUser(event.user);
        };

        chatClient.on('connection.changed', handleConnectionChanged);
        chatClient.on('user.updated', handleUserUpdated);

        return () => {
            chatClient.off('connection.changed', handleConnectionChanged);
            chatClient.off('user.updated', handleUserUpdated);
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isConnected) {
                chatClient.disconnectUser().catch(console.error);
            }
        };
    }, [isConnected]);

    const contextValue: StreamChatContextType = {
        client: chatClient,
        user,
        isConnected,
        connect,
        disconnect
    };

    if (!isInitialized) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Initializing Chat...</p>
                </div>
            </div>
        );
    }

    return (
        <StreamChatContext.Provider value={contextValue}>
            {isConnected ? (
                <Chat client={chatClient} theme={`str-chat__theme-${theme}`}>
                    {children}
                </Chat>
            ) : (
                children
            )}
        </StreamChatContext.Provider>
    );
};

// Custom hook to use Stream Chat context
export const useStreamChatContext = () => {
    const context = useContext(StreamChatContext);
    if (context === undefined) {
        throw new Error('useStreamChatContext must be used within a StreamChatProvider');
    }
    return context;
};

// HOC to wrap components with Stream Chat Provider
export const withStreamChat = <P extends object>(
    Component: React.ComponentType<P>,
    theme?: 'light' | 'dark'
) => {
    return (props: P) => (
        <StreamChatProvider theme={theme}>
            <Component {...props} />
        </StreamChatProvider>
    );
};

export default StreamChatProvider;