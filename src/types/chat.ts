export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageSender {
  id: string;
  username: string;
  profilePicture: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  status: MessageStatus;
  createdAt: string;
  localId?: string;
  isOptimistic?: boolean;
  failedReason?: string;
}

export interface Conversation {
  id: string;
  participants: MessageSender[];
  participantDetails?: MessageSender[];
  lastMessage: Message | null;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  updatedAt: string;
  createdAt?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  localId: string;
}

export interface FetchMessagesRequest {
  conversationId: string;
  cursor?: string;
  limit?: number;
}

export interface MessagesPage {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ConversationsPage {
  conversations: Conversation[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UserSearchResult {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  isVerified: boolean;
  followersCount: number;
}

export interface SearchUsersResponse {
  users: UserSearchResult[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type SocketConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresenceEvent {
  userId: string;
  isOnline: boolean;
}

export interface ReadReceiptEvent {
  conversationId: string;
  messageIds: string[];
  readBy: string;
}
