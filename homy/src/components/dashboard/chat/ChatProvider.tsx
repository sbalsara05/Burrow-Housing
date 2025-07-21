// fe/src/components/dashboard/chat/ChatProvider.tsx
import React, { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/slices/authSlice';

// --- Configuration ---
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
if (!STREAM_API_KEY) {
    throw new Error("VITE_STREAM_API_KEY is not set in environment variables.");
}

// Initialize the Stream client instance. This is done only once.
const chatClient = StreamChat.getInstance(STREAM_API_KEY);

interface ChatProviderProps {
    children: React.ReactNode;
}

const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [isClientReady, setIsClientReady] = useState(false);
    const currentUser = useSelector(selectCurrentUser);

    useEffect(() => {
        let didUnmount = false;

        const setupChatClient = async () => {
            if (!currentUser) {
                console.log("ChatProvider: No current user, waiting...");
                return;
            }

            if (chatClient.userID === currentUser._id && chatClient.wsConnection) {
                console.log("ChatProvider: Client is already connected for this user.");
                if (!didUnmount) setIsClientReady(true);
                return;
            }

            console.log(`ChatProvider: Setting up client for user ${currentUser.name} (${currentUser._id})`);

            try {
                // 1. Fetch the secure user token from our backend
                const response = await axios.get('http://localhost:3000/api/chat/token');
                const userToken = response.data.token;

                if (!userToken) {
                    throw new Error("No token received from backend");
                }

                // 2. Connect the user to Stream with the secure token
                await chatClient.connectUser(
                    {
                        id: currentUser._id,
                        name: currentUser.name,
                    },
                    userToken
                );

                console.log("ChatProvider: Stream user connected successfully.");
                if (!didUnmount) {
                    setIsClientReady(true);
                }
            } catch (error) {
                console.error("ChatProvider: Failed to connect to Stream Chat.", error);
                if (chatClient.userID) {
                    await chatClient.disconnectUser();
                }
                if (!didUnmount) {
                    setIsClientReady(false);
                }
            }
        };

        setupChatClient();

        return () => {
            didUnmount = true;
            console.log("ChatProvider: Unmounting. Disconnecting user from Stream.");
            if (chatClient.userID) {
                chatClient.disconnectUser().catch(err => {
                    console.error("ChatProvider: Error during disconnect on unmount.", err);
                });
            }
            setIsClientReady(false);
        };
    }, [currentUser]);

    if (!isClientReady) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Connecting to Chat...</p>
            </div>
        );
    }

    return (
        <Chat client={chatClient}>
            {children}
        </Chat>
    );
};

export default ChatProvider;