// Chat User Interface
export interface ChatUser {
   id: string;
   name: string;
   email?: string;
   avatar?: string;
   isOnline: boolean;
   lastSeen?: string;
   role?: 'admin' | 'moderator' | 'member';
   customFields?: Record<string, any>;
}

// Message Interface
export interface ChatMessage {
   id: string;
   text: string;
   senderId: string;
   senderName: string;
   senderAvatar?: string;
   timestamp: string;
   isCurrentUser: boolean;
   type: 'text' | 'image' | 'file' | 'system';
   status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
   
   // File/Image specific fields
   attachments?: ChatAttachment[];
   
   // Message metadata
   edited?: boolean;
   editedAt?: string;
   replyTo?: string;
   mentions?: string[];
   reactions?: ChatReaction[];
}

// Attachment Interface
export interface ChatAttachment {
   id: string;
   type: 'image' | 'file' | 'video' | 'audio';
   url: string;
   name: string;
   size: number;
   mimeType: string;
   thumbnailUrl?: string;
   duration?: number; // for video/audio
   width?: number; // for images/videos
   height?: number; // for images/videos
}

// Reaction Interface
export interface ChatReaction {
   type: string; // emoji or reaction type
   users: string[]; // user IDs who reacted
   count: number;
}

// Channel Interface
export interface ChatChannel {
   id: string;
   name?: string;
   type: 'direct' | 'group' | 'public' | 'private';
   description?: string;
   avatar?: string;
   members: ChatUser[];
   memberCount: number;
   lastMessage?: ChatMessage;
   lastMessageAt?: string;
   unreadCount: number;
   createdAt: string;
   updatedAt: string;
   createdBy: string;
   
   // Channel settings
   settings?: {
      allowFileUpload: boolean;
      allowImageUpload: boolean;
      allowLinkPreviews: boolean;
      maxMessageLength: number;
      typingIndicators: boolean;
      readReceipts: boolean;
      messageRetention: number; // days
   };
   
   // Custom fields
   customFields?: Record<string, any>;
}

// Typing Indicator Interface
export interface TypingIndicator {
   userId: string;
   userName: string;
   channelId: string;
   startedAt: string;
}

// Chat Event Interface
export interface ChatEvent {
   type: 'message.new' | 'message.updated' | 'message.deleted' | 
         'user.online' | 'user.offline' | 'user.typing' | 'user.stopped_typing' |
         'channel.created' | 'channel.updated' | 'channel.deleted' |
         'member.added' | 'member.removed' | 'member.updated';
   data: any;
   timestamp: string;
}

// Chat State Interface
export interface ChatState {
   // Connection
   isConnected: boolean;
   isConnecting: boolean;
   connectionError?: string;
   
   // Current user
   currentUser: ChatUser | null;
   
   // Channels
   channels: ChatChannel[];
   activeChannel: ChatChannel | null;
   isLoadingChannels: boolean;
   
   // Messages
   messages: ChatMessage[];
   isLoadingMessages: boolean;
   hasMoreMessages: boolean;
   
   // UI State
   selectedMessages: string[];
   searchQuery: string;
   searchResults: ChatMessage[];
   isSearching: boolean;
   
   // Typing indicators
   typingUsers: TypingIndicator[];
   
   // Notifications
   notifications: ChatNotification[];
   unreadTotalCount: number;
}

// Notification Interface
export interface ChatNotification {
   id: string;
   type: 'message' | 'mention' | 'channel_invite' | 'system';
   title: string;
   message: string;
   channelId?: string;
   userId?: string;
   timestamp: string;
   read: boolean;
   data?: any;
}

// Chat Configuration Interface
export interface ChatConfig {
   apiKey: string;
   userId: string;
   userToken: string;
   theme: 'light' | 'dark';
   language: string;
   
   // Feature flags
   features: {
      fileUpload: boolean;
      imageUpload: boolean;
      voiceMessages: boolean;
      videoCall: boolean;
      screenShare: boolean;
      messageReactions: boolean;
      messageReplies: boolean;
      messageEditing: boolean;
      messageDeletion: boolean;
      typingIndicators: boolean;
      readReceipts: boolean;
      onlineStatus: boolean;
   };
   
   // Limits
   limits: {
      maxFileSize: number; // bytes
      maxImageSize: number; // bytes
      maxMessageLength: number;
      maxChannelMembers: number;
      messageRetentionDays: number;
   };
}

// Chat Hook Return Type
export interface UseChatReturn {
   // State
   state: ChatState;
   
   // Actions
   connect: (user: ChatUser) => Promise<void>;
   disconnect: () => Promise<void>;
   
   // Channel actions
   createChannel: (members: string[], channelData?: Partial<ChatChannel>) => Promise<ChatChannel>;
   joinChannel: (channelId: string) => Promise<void>;
   leaveChannel: (channelId: string) => Promise<void>;
   setActiveChannel: (channel: ChatChannel | null) => void;
   
   // Message actions
   sendMessage: (text: string, attachments?: ChatAttachment[]) => Promise<void>;
   editMessage: (messageId: string, text: string) => Promise<void>;
   deleteMessage: (messageId: string) => Promise<void>;
   replyToMessage: (messageId: string, text: string) => Promise<void>;
   addReaction: (messageId: string, reaction: string) => Promise<void>;
   removeReaction: (messageId: string, reaction: string) => Promise<void>;
   
   // File actions
   uploadFile: (file: File) => Promise<ChatAttachment>;
   uploadImage: (file: File) => Promise<ChatAttachment>;
   
   // Search actions
   searchMessages: (query: string) => Promise<ChatMessage[]>;
   
   // Utility actions
   markChannelAsRead: (channelId: string) => Promise<void>;
   startTyping: (channelId: string) => void;
   stopTyping: (channelId: string) => void;
   
   // Error handling
   clearError: () => void;
}

// Component Props Interfaces
export interface ChatListProps {
   channels: ChatChannel[];
   activeChannel: ChatChannel | null;
   onChannelSelect: (channel: ChatChannel) => void;
   onChannelCreate: () => void;
   searchQuery: string;
   onSearchChange: (query: string) => void;
   isLoading: boolean;
}

export interface ChatWindowProps {
   channel: ChatChannel | null;
   messages: ChatMessage[];
   currentUser: ChatUser | null;
   onSendMessage: (text: string, attachments?: ChatAttachment[]) => void;
   onFileUpload: (file: File) => void;
   onImageUpload: (file: File) => void;
   isLoading: boolean;
   typingUsers: TypingIndicator[];
}

export interface MessageBubbleProps {
   message: ChatMessage;
   currentUser: ChatUser | null;
   onReply: (messageId: string) => void;
   onReact: (messageId: string, reaction: string) => void;
   onEdit: (messageId: string, text: string) => void;
   onDelete: (messageId: string) => void;
   showAvatar: boolean;
   showTimestamp: boolean;
}

export interface MessageInputProps {
   onSendMessage: (text: string, attachments?: ChatAttachment[]) => void;
   onFileUpload: (file: File) => void;
   onImageUpload: (file: File) => void;
   placeholder?: string;
   disabled?: boolean;
   maxLength?: number;
   allowFileUpload?: boolean;
   allowImageUpload?: boolean;
}

export interface FileUploadProps {
   onFileUpload: (file: File, type: 'image' | 'file') => void;
   onClose: () => void;
   acceptedTypes?: string[];
   maxFileSize?: number;
   allowMultiple?: boolean;
}

export interface TypingIndicatorProps {
   users: TypingIndicator[];
   currentChannelId: string;
}