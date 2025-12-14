import React, { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/slices/authSlice';
import { selectProfile, selectProfileStatus } from '../../../redux/slices/profileSlice';

// --- Configuration ---
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
if (!STREAM_API_KEY) {
    throw new Error("VITE_STREAM_API_KEY is not set in environment variables.");
}

const chatClient = StreamChat.getInstance(STREAM_API_KEY);

interface ChatProviderProps {
    children: React.ReactNode;
}

const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [isClientReady, setIsClientReady] = useState(false);
    const currentUser = useSelector(selectCurrentUser);
    const profile = useSelector(selectProfile);
    const profileStatus = useSelector(selectProfileStatus);

    useEffect(() => {
        let didUnmount = false;

        const setupChatClient = async () => {
            if (!currentUser || !profile || profileStatus !== 'succeeded') {
                return; // Wait for all data to be ready
            }

            // Ensure user ID is a string (MongoDB ObjectId might be an object)
            const userIdString = String(currentUser._id);
            
            const userToConnect = {
                id: userIdString,
                name: profile.username || currentUser.name,
                image: profile.image || undefined,
            };

            console.log("ChatProvider: User ID for connection:", userIdString);
            console.log("ChatProvider: User data:", { ...userToConnect, image: userToConnect.image ? 'present' : 'none' });

            // If client is already connected with the correct user, just ensure data is fresh
            if (chatClient.userID === userIdString) {
                console.log("ChatProvider: Client already connected. Forcing user data update...");
                await chatClient.upsertUser(userToConnect); // Force update user data
                if (!didUnmount) setIsClientReady(true);
                return;
            }

            console.log(`ChatProvider: Setting up new client connection for user ${currentUser.name}`);

            try {
                // Disconnect any previous user first to ensure a clean connection
                if (chatClient.userID) {
                    await chatClient.disconnectUser();
                }

                console.log("ChatProvider: Fetching token from backend...");
                const response = await axios.get('/api/chat/token');
                const userToken = response.data.token;

                if (!userToken) {
                    throw new Error("No token received from backend");
                }

                console.log("ChatProvider: Token received. Connecting user with data:", userToConnect);
                console.log("ChatProvider: Using API Key:", STREAM_API_KEY?.substring(0, 10) + "...");
                
                await chatClient.connectUser(userToConnect, userToken);

                console.log("ChatProvider: Stream user connected successfully. User ID:", chatClient.userID);
                if (!didUnmount) {
                    setIsClientReady(true);
                }
            } catch (error: any) {
                console.error("ChatProvider: Failed to connect to Stream Chat.", error);
                console.error("ChatProvider: Error details:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    stack: error.stack
                });
                if (!didUnmount) {
                    setIsClientReady(false);
                }
            }
        };

        setupChatClient();

        return () => {
            didUnmount = true;
            if (chatClient.userID) {
                chatClient.disconnectUser().catch(err => {
                    console.error("ChatProvider: Error during disconnect on unmount.", err);
                });
            }
            setIsClientReady(false);
        };
    }, [currentUser, profile, profileStatus]);

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