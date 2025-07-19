// keep core types as they are still useful for custom components.
// The `stream-chat` and `stream-chat-react` libraries also export their own
// more detailed types which can be used directly in components when needed.

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
    replyTo?: string;
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
