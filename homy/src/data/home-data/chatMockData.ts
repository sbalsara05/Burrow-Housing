// src/data/chatMockData.ts
import {
    User,
    Message,
    Channel,
    ChannelMember,
    MessageAttachment,
    ChatApiResponse,
    SendMessageRequest,
    CreateChannelRequest,
    GetMessagesRequest
} from '../../types/chat';

// Mock Users
export const mockUsers: User[] = [
    {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: '/assets/images/agent/img_01.jpg',
        isOnline: true,
        role: 'user',
        phone: '+1 (555) 123-4567',
        isVerified: true
    },
    {
        id: 'user-2',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        image: '/assets/images/agent/img_01.jpg',
        isOnline: false,
        lastSeen: '2 hours ago',
        role: 'agent',
        phone: '+1 (555) 987-6543',
        isVerified: true
    },
    {
        id: 'user-3',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        image: '/assets/images/agent/img_01.jpg',
        isOnline: true,
        role: 'user',
        phone: '+1 (555) 456-7890',
        isVerified: true
    },
    {
        id: 'user-4',
        name: 'Emma Brown',
        email: 'emma.brown@example.com',
        image: '/assets/images/agent/img_01.jpg',
        isOnline: true,
        role: 'admin',
        phone: '+1 (555) 321-0987',
        isVerified: true
    },
    {
        id: 'current-user',
        name: 'You',
        email: 'you@example.com',
        image: '/assets/images/agent/img_01.jpg',
        isOnline: true,
        role: 'user',
        phone: '+1 (555) 111-2222',
        isVerified: true
    }
];

// Mock Messages
export const mockMessages: { [channelId: string]: Message[] } = {
    'channel-1': [
        {
            id: 'msg-1',
            channelId: 'channel-1',
            senderId: 'user-1',
            senderName: 'John Doe',
            senderImage: '/images/avatars/user1.jpg',
            text: 'Hi! I\'m interested in the property listing you have in Back Bay.',
            timestamp: '2025-01-10T10:30:00Z',
            isCurrentUser: false,
            type: 'text',
            deliveryStatus: 'read'
        },
        {
            id: 'msg-2',
            channelId: 'channel-1',
            senderId: 'current-user',
            senderName: 'You',
            senderImage: '/images/avatars/current-user.jpg',
            text: 'Great! I\'d be happy to help you with that property. It\'s a beautiful 2-bedroom apartment.',
            timestamp: '2025-01-10T10:32:00Z',
            isCurrentUser: true,
            type: 'text',
            deliveryStatus: 'read'
        },
        {
            id: 'msg-3',
            channelId: 'channel-1',
            senderId: 'user-1',
            senderName: 'John Doe',
            senderImage: '/images/avatars/user1.jpg',
            text: 'Can you tell me more about the location and nearby amenities?',
            timestamp: '2025-01-10T10:35:00Z',
            isCurrentUser: false,
            type: 'text',
            deliveryStatus: 'read'
        },
        {
            id: 'msg-4',
            channelId: 'channel-1',
            senderId: 'current-user',
            senderName: 'You',
            senderImage: '/images/avatars/current-user.jpg',
            text: 'Here are some photos of the property and neighborhood:',
            timestamp: '2025-01-10T10:40:00Z',
            isCurrentUser: true,
            type: 'image',
            attachments: [
                {
                    id: 'att-1',
                    type: 'image',
                    url: '/images/properties/property1.jpg',
                    name: 'Property Photos',
                    size: 1024000,
                    mimeType: 'image/jpeg',
                    thumbnailUrl: '/images/properties/property1-thumb.jpg'
                }
            ],
            deliveryStatus: 'read'
        }
    ],
    'channel-2': [
        {
            id: 'msg-5',
            channelId: 'channel-2',
            senderId: 'user-2',
            senderName: 'Sarah Wilson',
            senderImage: '/images/avatars/user2.jpg',
            text: 'Thank you for the property details. The apartment looks perfect for my needs.',
            timestamp: '2025-01-10T09:15:00Z',
            isCurrentUser: false,
            type: 'text',
            deliveryStatus: 'read'
        },
        {
            id: 'msg-6',
            channelId: 'channel-2',
            senderId: 'current-user',
            senderName: 'You',
            senderImage: '/images/avatars/current-user.jpg',
            text: 'I\'m glad you like it! Would you like to schedule a viewing?',
            timestamp: '2025-01-10T09:20:00Z',
            isCurrentUser: true,
            type: 'text',
            deliveryStatus: 'read'
        },
        {
            id: 'msg-7',
            channelId: 'channel-2',
            senderId: 'user-2',
            senderName: 'Sarah Wilson',
            senderImage: '/images/avatars/user2.jpg',
            text: 'Yes, I would love to schedule a viewing. Here\'s my availability document:',
            timestamp: '2025-01-10T09:25:00Z',
            isCurrentUser: false,
            type: 'file',
            attachments: [
                {
                    id: 'att-2',
                    type: 'file',
                    url: '/documents/availability.pdf',
                    name: 'My Availability.pdf',
                    size: 512000,
                    mimeType: 'application/pdf'
                }
            ],
            deliveryStatus: 'read'
        }
    ],
    'channel-3': [
        {
            id: 'msg-8',
            channelId: 'channel-3',
            senderId: 'user-3',
            senderName: 'Mike Johnson',
            senderImage: '/images/avatars/user3.jpg',
            text: 'Is the property in Jamaica Plain still available?',
            timestamp: '2025-01-10T08:45:00Z',
            isCurrentUser: false,
            type: 'text',
            deliveryStatus: 'read'
        },
        {
            id: 'msg-9',
            channelId: 'channel-3',
            senderId: 'current-user',
            senderName: 'You',
            senderImage: '/images/avatars/current-user.jpg',
            text: 'Yes, it\'s still available! It\'s a great single room in a shared apartment.',
            timestamp: '2025-01-10T08:50:00Z',
            isCurrentUser: true,
            type: 'text',
            deliveryStatus: 'delivered'
        }
    ],
    'channel-4': [
        {
            id: 'msg-10',
            channelId: 'channel-4',
            senderId: 'user-4',
            senderName: 'Emma Brown',
            senderImage: '/images/avatars/user4.jpg',
            text: 'Hey team! Welcome to the property management group chat.',
            timestamp: '2025-01-10T07:00:00Z',
            isCurrentUser: false,
            type: 'text',
            deliveryStatus: 'read'
        },
        {
            id: 'msg-11',
            channelId: 'channel-4',
            senderId: 'current-user',
            senderName: 'You',
            senderImage: '/images/avatars/current-user.jpg',
            text: 'Thanks Emma! Excited to be part of the team.',
            timestamp: '2025-01-10T07:05:00Z',
            isCurrentUser: true,
            type: 'text',
            deliveryStatus: 'read'
        }
    ]
};

// Mock Channels
export const mockChannels: Channel[] = [
    {
        id: 'channel-1',
        type: 'direct',
        members: [
            {
                user: mockUsers[0], // John Doe
                role: 'member',
                joinedAt: '2025-01-10T10:30:00Z',
                isActive: true
            },
            {
                user: mockUsers[4], // Current User
                role: 'member',
                joinedAt: '2025-01-10T10:30:00Z',
                isActive: true
            }
        ],
        lastMessage: mockMessages['channel-1'][mockMessages['channel-1'].length - 1],
        unreadCount: 2,
        createdAt: '2025-01-10T10:30:00Z',
        updatedAt: '2025-01-10T10:40:00Z'
    },
    {
        id: 'channel-2',
        type: 'direct',
        members: [
            {
                user: mockUsers[1], // Sarah Wilson
                role: 'member',
                joinedAt: '2025-01-10T09:15:00Z',
                isActive: true
            },
            {
                user: mockUsers[4], // Current User
                role: 'member',
                joinedAt: '2025-01-10T09:15:00Z',
                isActive: true
            }
        ],
        lastMessage: mockMessages['channel-2'][mockMessages['channel-2'].length - 1],
        unreadCount: 0,
        createdAt: '2025-01-10T09:15:00Z',
        updatedAt: '2025-01-10T09:25:00Z'
    },
    {
        id: 'channel-3',
        type: 'direct',
        members: [
            {
                user: mockUsers[2], // Mike Johnson
                role: 'member',
                joinedAt: '2025-01-10T08:45:00Z',
                isActive: true
            },
            {
                user: mockUsers[4], // Current User
                role: 'member',
                joinedAt: '2025-01-10T08:45:00Z',
                isActive: true
            }
        ],
        lastMessage: mockMessages['channel-3'][mockMessages['channel-3'].length - 1],
        unreadCount: 1,
        createdAt: '2025-01-10T08:45:00Z',
        updatedAt: '2025-01-10T08:50:00Z'
    }
];

// Mock API Service Class
export class ChatMockService {
    private static instance: ChatMockService;
    private users: User[] = [...mockUsers];
    private channels: Channel[] = [...mockChannels];
    private messages: { [channelId: string]: Message[] } = { ...mockMessages };
    private currentUser: User = mockUsers[4]; // Current user

    public static getInstance(): ChatMockService {
        if (!ChatMockService.instance) {
            ChatMockService.instance = new ChatMockService();
        }
        return ChatMockService.instance;
    }

    // Simulate API delay
    private delay(ms: number = 300): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate unique ID
    private generateId(): string {
        return 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Get current user
    async getCurrentUser(): Promise<ChatApiResponse<User>> {
        await this.delay();
        return {
            success: true,
            data: this.currentUser
        };
    }

    // Get all channels for current user
    async getChannels(): Promise<ChatApiResponse<Channel[]>> {
        await this.delay();

        // Sort channels by last message timestamp
        const sortedChannels = this.channels
            .filter(channel =>
                channel.members.some(member => member.user.id === this.currentUser.id)
            )
            .sort((a, b) => {
                const aTime = new Date(a.lastMessage?.timestamp || a.updatedAt).getTime();
                const bTime = new Date(b.lastMessage?.timestamp || b.updatedAt).getTime();
                return bTime - aTime;
            });

        return {
            success: true,
            data: sortedChannels
        };
    }

    // Get messages for a channel
    async getMessages(request: GetMessagesRequest): Promise<ChatApiResponse<Message[]>> {
        await this.delay();

        const { channelId, limit = 50 } = request;
        const channelMessages = this.messages[channelId] || [];

        // Sort messages by timestamp
        const sortedMessages = channelMessages.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return {
            success: true,
            data: sortedMessages.slice(-limit), // Get last N messages
            pagination: {
                page: 1,
                limit,
                total: sortedMessages.length,
                hasMore: false
            }
        };
    }

    // Send a message
    async sendMessage(request: SendMessageRequest): Promise<ChatApiResponse<Message>> {
        await this.delay();

        const { channelId, text, attachments = [], replyTo } = request;

        const newMessage: Message = {
            id: this.generateId(),
            channelId,
            senderId: this.currentUser.id,
            senderName: this.currentUser.name,
            senderImage: this.currentUser.image,
            text,
            timestamp: new Date().toISOString(),
            isCurrentUser: true,
            type: attachments.length > 0 ? 'file' : 'text',
            attachments: attachments.map((file, index) => ({
                id: `att-${Date.now()}-${index}`,
                type: file.type.startsWith('image/') ? 'image' : 'file',
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                mimeType: file.type
            })) as MessageAttachment[],
            replyTo,
            deliveryStatus: 'sent'
        };

        // Add message to channel
        if (!this.messages[channelId]) {
            this.messages[channelId] = [];
        }
        this.messages[channelId].push(newMessage);

        // Update channel's last message
        const channelIndex = this.channels.findIndex(c => c.id === channelId);
        if (channelIndex !== -1) {
            this.channels[channelIndex].lastMessage = newMessage;
            this.channels[channelIndex].updatedAt = new Date().toISOString();
        }

        return {
            success: true,
            data: newMessage
        };
    }

    // Create a new channel
    async createChannel(request: CreateChannelRequest): Promise<ChatApiResponse<Channel>> {
        await this.delay();

        const { name, type, members, description } = request;

        const channelMembers: ChannelMember[] = members.map(userId => {
            const user = this.users.find(u => u.id === userId);
            if (!user) throw new Error(`User ${userId} not found`);

            return {
                user,
                role: user.id === this.currentUser.id ? 'owner' : 'member',
                joinedAt: new Date().toISOString(),
                isActive: true
            };
        });

        const newChannel: Channel = {
            id: this.generateId(),
            name,
            type,
            members: channelMembers,
            unreadCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description
        };

        this.channels.push(newChannel);

        return {
            success: true,
            data: newChannel
        };
    }

    // Search users
    async searchUsers(query: string): Promise<ChatApiResponse<User[]>> {
        await this.delay();

        const filteredUsers = this.users.filter(user =>
            user.id !== this.currentUser.id && (
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
            )
        );

        return {
            success: true,
            data: filteredUsers
        };
    }

    // Mark channel as read
    async markChannelAsRead(channelId: string): Promise<ChatApiResponse<void>> {
        await this.delay();

        const channelIndex = this.channels.findIndex(c => c.id === channelId);
        if (channelIndex !== -1) {
            this.channels[channelIndex].unreadCount = 0;
        }

        return {
            success: true,
            data: undefined
        };
    }

    // Upload file (mock implementation)
    async uploadFile(file: File): Promise<ChatApiResponse<MessageAttachment>> {
        await this.delay(1000); // Simulate upload time

        const attachment: MessageAttachment = {
            id: this.generateId(),
            type: file.type.startsWith('image/') ? 'image' : 'file',
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            mimeType: file.type
        };

        return {
            success: true,
            data: attachment
        };
    }

    // Get online users
    async getOnlineUsers(): Promise<ChatApiResponse<User[]>> {
        await this.delay();

        const onlineUsers = this.users.filter(user => user.isOnline);

        return {
            success: true,
            data: onlineUsers
        };
    }

    // Update user online status
    async updateUserStatus(isOnline: boolean): Promise<ChatApiResponse<void>> {
        await this.delay();

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].isOnline = isOnline;
            this.users[userIndex].lastSeen = isOnline ? undefined : new Date().toISOString();
        }

        return {
            success: true,
            data: undefined
        };
    }

    // Simulate receiving a message (for testing)
    simulateIncomingMessage(channelId: string, fromUserId: string, text: string): void {
        const sender = this.users.find(u => u.id === fromUserId);
        if (!sender) return;

        const newMessage: Message = {
            id: this.generateId(),
            channelId,
            senderId: fromUserId,
            senderName: sender.name,
            senderImage: sender.image,
            text,
            timestamp: new Date().toISOString(),
            isCurrentUser: false,
            type: 'text',
            deliveryStatus: 'sent'
        };

        if (!this.messages[channelId]) {
            this.messages[channelId] = [];
        }
        this.messages[channelId].push(newMessage);

        // Update channel's last message and unread count
        const channelIndex = this.channels.findIndex(c => c.id === channelId);
        if (channelIndex !== -1) {
            this.channels[channelIndex].lastMessage = newMessage;
            this.channels[channelIndex].unreadCount += 1;
            this.channels[channelIndex].updatedAt = new Date().toISOString();
        }
    }
}

// Export singleton instance
export const chatMockService = ChatMockService.getInstance();