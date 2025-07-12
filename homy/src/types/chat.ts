// src/types/chat.ts
export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    isOnline: boolean;
    lastSeen?: string;
    role?: 'user' | 'admin' | 'agent';
    phone?: string;
    isVerified?: boolean;
}

export interface Message {
    id: string;
    channelId: string;
    senderId: string;
    senderName: string;
    senderImage?: string;
    text: string;
    timestamp: string;
    isCurrentUser: boolean;
    type: 'text' | 'image' | 'file' | 'system';
    attachments?: MessageAttachment[];
    replyTo?: string; // Message ID being replied to
    isEdited?: boolean;
    isDeleted?: boolean;
    reactions?: MessageReaction[];
    deliveryStatus?: 'sent' | 'delivered' | 'read';
}

export interface MessageAttachment {
    id: string;
    type: 'image' | 'file' | 'audio' | 'video';
    url: string;
    name: string;
    size: number;
    mimeType: string;
    thumbnailUrl?: string;
}

export interface MessageReaction {
    emoji: string;
    count: number;
    userIds: string[];
}

export interface Channel {
    id: string;
    name?: string;
    type: 'direct' | 'group' | 'public';
    members: ChannelMember[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
    isArchived?: boolean;
    description?: string;
    avatar?: string;
}

export interface ChannelMember {
    user: User;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
    isActive: boolean;
}

export interface ChatState {
    users: User[];
    channels: Channel[];
    messages: { [channelId: string]: Message[] };
    activeChannel: string | null;
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
    typingUsers: { [channelId: string]: string[] };
    onlineUsers: string[];
}

export interface TypingIndicator {
    channelId: string;
    userId: string;
    userName: string;
    timestamp: string;
}

export interface ChatNotification {
    id: string;
    type: 'message' | 'mention' | 'channel_invite' | 'user_joined';
    channelId: string;
    senderId: string;
    title: string;
    body: string;
    timestamp: string;
    isRead: boolean;
}

// API Response Types
export interface ChatApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

export interface SendMessageRequest {
    channelId: string;
    text: string;
    attachments?: File[];
    replyTo?: string;
}

export interface CreateChannelRequest {
    name?: string;
    type: 'direct' | 'group' | 'public';
    members: string[];
    description?: string;
}

export interface UpdateChannelRequest {
    name?: string;
    description?: string;
    avatar?: File;
}

export interface GetMessagesRequest {
    channelId: string;
    page?: number;
    limit?: number;
    before?: string; // Message ID for pagination
}

export interface SearchRequest {
    query: string;
    type?: 'users' | 'channels' | 'messages';
    limit?: number;
}