// src/services/chatApiService.ts
import {
    User,
    Message,
    Channel,
    MessageAttachment,
    ChatApiResponse,
    SendMessageRequest,
    CreateChannelRequest,
    GetMessagesRequest,
    SearchRequest
} from '../types/chat';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const CHAT_API_URL = `${API_BASE_URL}/chat`;

// Real API Service Class
export class ChatApiService {
    private static instance: ChatApiService;
    private token: string | null = null;

    public static getInstance(): ChatApiService {
        if (!ChatApiService.instance) {
            ChatApiService.instance = new ChatApiService();
        }
        return ChatApiService.instance;
    }

    // Set authentication token
    setAuthToken(token: string | null) {
        this.token = token;
    }

    // Get auth headers
    private getAuthHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Handle API response
    private async handleResponse<T>(response: Response): Promise<ChatApiResponse<T>> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Get current user
    async getCurrentUser(): Promise<ChatApiResponse<User>> {
        const response = await fetch(`${CHAT_API_URL}/user`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<User>(response);
    }

    // Get user channels
    async getChannels(): Promise<ChatApiResponse<Channel[]>> {
        const response = await fetch(`${CHAT_API_URL}/channels`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<Channel[]>(response);
    }

    // Get messages for a channel
    async getMessages(request: GetMessagesRequest): Promise<ChatApiResponse<Message[]>> {
        const { channelId, page = 1, limit = 50, before } = request;

        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(before && { before })
        });

        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/messages?${params}`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<Message[]>(response);
    }

    // Send a message
    async sendMessage(request: SendMessageRequest): Promise<ChatApiResponse<Message>> {
        const { channelId, text, attachments = [], replyTo } = request;

        // If there are attachments, use FormData
        if (attachments.length > 0) {
            const formData = new FormData();
            formData.append('text', text);
            if (replyTo) formData.append('replyTo', replyTo);

            attachments.forEach((file, index) => {
                formData.append(`attachments`, file);
            });

            const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/messages`, {
                method: 'POST',
                headers: {
                    ...(this.token && { Authorization: `Bearer ${this.token}` })
                },
                body: formData
            });

            return this.handleResponse<Message>(response);
        }

        // Text-only message
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/messages`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ text, replyTo })
        });

        return this.handleResponse<Message>(response);
    }

    // Create a new channel
    async createChannel(request: CreateChannelRequest): Promise<ChatApiResponse<Channel>> {
        const response = await fetch(`${CHAT_API_URL}/channels`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        return this.handleResponse<Channel>(response);
    }

    // Search users
    async searchUsers(query: string): Promise<ChatApiResponse<User[]>> {
        const params = new URLSearchParams({
            q: query,
            type: 'users'
        });

        const response = await fetch(`${CHAT_API_URL}/search?${params}`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<User[]>(response);
    }

    // Mark channel as read
    async markChannelAsRead(channelId: string): Promise<ChatApiResponse<void>> {
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/read`, {
            method: 'POST',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<void>(response);
    }

    // Upload file
    async uploadFile(file: File): Promise<ChatApiResponse<MessageAttachment>> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${CHAT_API_URL}/upload`, {
            method: 'POST',
            headers: {
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            body: formData
        });

        return this.handleResponse<MessageAttachment>(response);
    }

    // Get channel members
    async getChannelMembers(channelId: string): Promise<ChatApiResponse<User[]>> {
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/members`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<User[]>(response);
    }

    // Add member to channel
    async addMemberToChannel(channelId: string, userId: string): Promise<ChatApiResponse<void>> {
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/members`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ userId })
        });

        return this.handleResponse<void>(response);
    }

    // Remove member from channel
    async removeMemberFromChannel(channelId: string, userId: string): Promise<ChatApiResponse<void>> {
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/members/${userId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<void>(response);
    }

    // Update message
    async updateMessage(messageId: string, text: string): Promise<ChatApiResponse<Message>> {
        const response = await fetch(`${CHAT_API_URL}/messages/${messageId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ text })
        });

        return this.handleResponse<Message>(response);
    }

    // Delete message
    async deleteMessage(messageId: string): Promise<ChatApiResponse<void>> {
        const response = await fetch(`${CHAT_API_URL}/messages/${messageId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<void>(response);
    }

    // Get online users
    async getOnlineUsers(): Promise<ChatApiResponse<User[]>> {
        const response = await fetch(`${CHAT_API_URL}/users/online`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<User[]>(response);
    }

    // Update user online status
    async updateUserStatus(isOnline: boolean): Promise<ChatApiResponse<void>> {
        const response = await fetch(`${CHAT_API_URL}/user/status`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ isOnline })
        });

        return this.handleResponse<void>(response);
    }

    // Search messages
    async searchMessages(request: SearchRequest): Promise<ChatApiResponse<Message[]>> {
        const { query, type = 'messages', limit = 20 } = request;

        const params = new URLSearchParams({
            q: query,
            type,
            limit: limit.toString()
        });

        const response = await fetch(`${CHAT_API_URL}/search?${params}`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<Message[]>(response);
    }

    // Get channel info
    async getChannelInfo(channelId: string): Promise<ChatApiResponse<Channel>> {
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<Channel>(response);
    }

    // Update channel
    async updateChannel(channelId: string, data: Partial<Channel>): Promise<ChatApiResponse<Channel>> {
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });

        return this.handleResponse<Channel>(response);
    }

    // Leave channel
    async leaveChannel(channelId: string): Promise<ChatApiResponse<void>> {
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/leave`, {
            method: 'POST',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<void>(response);
    }

    // Archive channel
    async archiveChannel(channelId: string): Promise<ChatApiResponse<void>> {
        const response = await fetch(`${CHAT_API_URL}/channels/${channelId}/archive`, {
            method: 'POST',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<void>(response);
    }

    // Get user presence
    async getUserPresence(userId: string): Promise<ChatApiResponse<{ isOnline: boolean; lastSeen?: string }>> {
        const response = await fetch(`${CHAT_API_URL}/users/${userId}/presence`, {
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<{ isOnline: boolean; lastSeen?: string }>(response);
    }
}

// Export singleton instance
export const chatApiService = ChatApiService.getInstance();