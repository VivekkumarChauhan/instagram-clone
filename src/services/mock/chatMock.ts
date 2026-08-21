import { mockDelay } from '@utils/mockDelay';
import { MESSAGES_PAGE_SIZE } from '@utils/constants';
import type {
  Conversation,
  Message,
  MessageSender,
  MessagesPage,
  ConversationsPage,
  UserSearchResult,
  SearchUsersResponse,
} from '@appTypes/chat';

const MOCK_USERS: (UserSearchResult & MessageSender)[] = [
  { id: 'u1', username: 'alex.captures', fullName: 'Alex Johnson', profilePicture: 'https://i.pravatar.cc/150?img=2', isVerified: true, followersCount: 12400 },
  { id: 'u2', username: 'sarah.travels', fullName: 'Sarah Williams', profilePicture: 'https://i.pravatar.cc/150?img=3', isVerified: false, followersCount: 3200 },
  { id: 'u3', username: 'mike.adventure', fullName: 'Mike Thompson', profilePicture: 'https://i.pravatar.cc/150?img=4', isVerified: true, followersCount: 87000 },
  { id: 'u4', username: 'emma.creates', fullName: 'Emma Davis', profilePicture: 'https://i.pravatar.cc/150?img=5', isVerified: false, followersCount: 1100 },
  { id: 'u5', username: 'david.vibes', fullName: 'David Miller', profilePicture: 'https://i.pravatar.cc/150?img=6', isVerified: false, followersCount: 540 },
  { id: 'u6', username: 'lisa.moments', fullName: 'Lisa Anderson', profilePicture: 'https://i.pravatar.cc/150?img=7', isVerified: true, followersCount: 45000 },
  { id: 'u7', username: 'ross.geller', fullName: 'Ross Geller', profilePicture: 'https://i.pravatar.cc/150?img=8', isVerified: false, followersCount: 220 },
  { id: 'u8', username: 'rachel.green', fullName: 'Rachel Green', profilePicture: 'https://i.pravatar.cc/150?img=9', isVerified: false, followersCount: 1890 },
];

const SAMPLE_MESSAGES = [
  'Hey! How are you?',
  'That reel was amazing! 🔥',
  'Let\'s catch up soon!',
  'Did you see the game last night?',
  'LOL that was hilarious 😂',
  'Miss you!',
  'Can we talk?',
  'Sent you a reel you\'ll love',
  'What are your plans this weekend?',
  'Just saw your post! Beautiful shot 📸',
];

function generateMessages(conversationId: string, count: number, currentUserId = 'user-001'): Message[] {
  return Array.from({ length: count }, (_, i) => {
    const sender = i % 3 === 0 ? MOCK_USERS[i % MOCK_USERS.length] : { id: currentUserId, username: 'johndoe', profilePicture: 'https://i.pravatar.cc/150?img=1' };
    return {
      id: `msg-${conversationId}-${i}`,
      conversationId,
      sender,
      content: SAMPLE_MESSAGES[i % SAMPLE_MESSAGES.length],
      status: 'read' as const,
      createdAt: new Date(Date.now() - (count - i) * 5 * 60 * 1000).toISOString(),
    };
  });
}

function generateConversation(user: typeof MOCK_USERS[0], index: number): Conversation {
  const conversationId = `conv-${user.id}`;
  const messages = generateMessages(conversationId, 5);
  return {
    id: conversationId,
    participants: [user],
    lastMessage: messages[messages.length - 1],
    unreadCount: index < 3 ? Math.floor(Math.random() * 5) + 1 : 0,
    isOnline: Math.random() > 0.5,
    isTyping: false,
    updatedAt: new Date(Date.now() - index * 30 * 60 * 1000).toISOString(),
  };
}

const MOCK_CONVERSATIONS: Conversation[] = MOCK_USERS.map((user, i) => generateConversation(user, i));

export const chatMock = {
  async fetchConversations(cursor: string | null): Promise<ConversationsPage> {
    await mockDelay();
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const pageSize = 10;
    const slice = MOCK_CONVERSATIONS.slice(startIndex, startIndex + pageSize);
    const nextCursor = startIndex + pageSize < MOCK_CONVERSATIONS.length ? String(startIndex + pageSize) : null;
    return { conversations: slice, nextCursor, hasMore: nextCursor !== null };
  },

  async fetchMessages(conversationId: string, cursor: string | null): Promise<MessagesPage> {
    await mockDelay();
    const total = 40;
    const endIndex = cursor ? parseInt(cursor, 10) : total;
    const startIndex = Math.max(0, endIndex - MESSAGES_PAGE_SIZE);
    const messages = generateMessages(conversationId, total, 'user-001');
    const slice = messages.slice(startIndex, endIndex);
    const nextCursor = startIndex > 0 ? String(startIndex) : null;
    return { messages: slice.reverse(), nextCursor, hasMore: nextCursor !== null };
  },

  async sendMessage(conversationId: string, content: string, localId: string): Promise<Message> {
    await mockDelay(200, 500);
    return {
      id: `msg-server-${Date.now()}`,
      conversationId,
      sender: { id: 'user-001', username: 'johndoe', profilePicture: 'https://i.pravatar.cc/150?img=1' },
      content,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
  },

  async searchUsers(query: string, cursor: string | null): Promise<SearchUsersResponse> {
    await mockDelay(300, 700);
    const filtered = MOCK_USERS.filter(
      u => u.username.toLowerCase().includes(query.toLowerCase()) ||
           u.fullName.toLowerCase().includes(query.toLowerCase()),
    );
    return { users: filtered, nextCursor: null, hasMore: false };
  },

  async markMessagesRead(conversationId: string, messageIds: string[]): Promise<void> {
    await mockDelay(50, 150);
  },

  getConversationById(conversationId: string): Conversation | undefined {
    return MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  },
};
