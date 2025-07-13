import { StreamChat } from 'stream-chat';

// Stream Chat configuration
const apiKey = import.meta.env.VITE_STREAM_CHAT_API_KEY;

if (!apiKey) {
    throw new Error('VITE_STREAM_CHAT_API_KEY is not defined in environment variables');
}

// Initialize Stream Chat client
export const chatClient = StreamChat.getInstance(apiKey);

// User authentication
export const connectUser = async (user: {
    id: string;
    name: string;
    image?: string;
    email?: string;
}) => {
    try {
        // In production, get the token from your backend
        const token = chatClient.devToken(user.id);

        await chatClient.connectUser(user, token);
        console.log('User connected to Stream Chat:', user.name);

        return chatClient.user;
    } catch (error) {
        console.error('Failed to connect user:', error);
        throw error;
    }
};

// Disconnect user
export const disconnectUser = async () => {
    try {
        await chatClient.disconnectUser();
        console.log('User disconnected from Stream Chat');
    } catch (error) {
        console.error('Failed to disconnect user:', error);
    }
};

// Create or get a channel
export const createChannel = async (
    type: string = 'messaging',
    channelId?: string,
    members?: string[],
    channelData?: any
) => {
    try {
        const channel = chatClient.channel(type, channelId, {
            members,
            ...channelData
        });

        await channel.create();
        return channel;
    } catch (error) {
        console.error('Failed to create channel:', error);
        throw error;
    }
};

// Get user channels
export const getUserChannels = async () => {
    try {
        const filter = { members: { $in: [chatClient.userID] } };
        const sort = { last_message_at: -1 };

        const channels = await chatClient.queryChannels(filter, sort);
        return channels;
    } catch (error) {
        console.error('Failed to get user channels:', error);
        throw error;
    }
};

// Search users
export const searchUsers = async (query: string) => {
    try {
        const response = await chatClient.queryUsers(
            {
                $or: [
                    { name: { $autocomplete: query } },
                    { email: { $autocomplete: query } }
                ]
            },
            { name: 1 }
        );

        return response.users;
    } catch (error) {
        console.error('Failed to search users:', error);
        throw error;
    }
};

// Send message
export const sendMessage = async (channelId: string, message: string, attachments?: any[]) => {
    try {
        const channel = chatClient.channel('messaging', channelId);

        const messageData = {
            text: message,
            attachments: attachments || []
        };

        const response = await channel.sendMessage(messageData);
        return response.message;
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
};

// Upload file
export const uploadFile = async (file: File) => {
    try {
        const response = await chatClient.sendFile(file, undefined, 'chat-files');
        return response.file;
    } catch (error) {
        console.error('Failed to upload file:', error);
        throw error;
    }
};

// Delete message
export const deleteMessage = async (messageId: string) => {
    try {
        const response = await chatClient.deleteMessage(messageId);
        return response;
    } catch (error) {
        console.error('Failed to delete message:', error);
        throw error;
    }
};

// Mark channel as read
export const markChannelAsRead = async (channelId: string) => {
    try {
        const channel = chatClient.channel('messaging', channelId);
        await channel.markRead();
    } catch (error) {
        console.error('Failed to mark channel as read:', error);
    }
};

// Get channel members
export const getChannelMembers = async (channelId: string) => {
    try {
        const channel = chatClient.channel('messaging', channelId);
        const response = await channel.queryMembers({});
        return response.members;
    } catch (error) {
        console.error('Failed to get channel members:', error);
        throw error;
    }
};

// Add member to channel
export const addMemberToChannel = async (channelId: string, userId: string) => {
    try {
        const channel = chatClient.channel('messaging', channelId);
        await channel.addMembers([userId]);
    } catch (error) {
        console.error('Failed to add member to channel:', error);
        throw error;
    }
};

// Remove member from channel
export const removeMemberFromChannel = async (channelId: string, userId: string) => {
    try {
        const channel = chatClient.channel('messaging', channelId);
        await channel.removeMembers([userId]);
    } catch (error) {
        console.error('Failed to remove member from channel:', error);
        throw error;
    }
};

export default chatClient;