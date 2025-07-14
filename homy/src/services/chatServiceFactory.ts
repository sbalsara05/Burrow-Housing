// src/services/chatServiceFactory.ts
import { chatMockService } from '../data/home-data/chatMockData';
import { chatApiService } from './chatApiService';

// Service interface that both mock and real services implement
export interface IChatService {
    getCurrentUser(): Promise<any>;
    getChannels(): Promise<any>;
    getMessages(request: any): Promise<any>;
    sendMessage(request: any): Promise<any>;
    createChannel(request: any): Promise<any>;
    searchUsers(query: string): Promise<any>;
    markChannelAsRead(channelId: string): Promise<any>;
    uploadFile(file: File): Promise<any>;
    getOnlineUsers(): Promise<any>;
    updateUserStatus(isOnline: boolean): Promise<any>;
}

// Environment configuration
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_CHAT === 'true' ||
    import.meta.env.NODE_ENV === 'development';

// Chat service factory
export class ChatServiceFactory {
    private static instance: IChatService;

    public static getChatService(): IChatService {
        if (!ChatServiceFactory.instance) {
            if (USE_MOCK_DATA) {
                console.log('🎭 Using Mock Chat Service');
                ChatServiceFactory.instance = chatMockService;
            } else {
                console.log('🌐 Using Real Chat API Service');
                ChatServiceFactory.instance = chatApiService;
            }
        }
        return ChatServiceFactory.instance;
    }

    // Force switch to mock service (for testing)
    public static useMockService(): void {
        console.log('🎭 Switching to Mock Chat Service');
        ChatServiceFactory.instance = chatMockService;
    }

    // Force switch to real API service
    public static useApiService(): void {
        console.log('🌐 Switching to Real Chat API Service');
        ChatServiceFactory.instance = chatApiService;
    }

    // Get current service type
    public static getCurrentServiceType(): 'mock' | 'api' {
        return ChatServiceFactory.instance === chatMockService ? 'mock' : 'api';
    }
}

// Export the service instance
export const chatService = ChatServiceFactory.getChatService();