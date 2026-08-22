import { create } from 'zustand';
import { setItem, getItem } from '@utils/mmkvStorage';
import { chatApi } from '@services/api/chatApi';
import { chatSocket } from '@services/socket/chatSocket';
import { socketClient } from '@services/socket/socketClient';
import { useAuthStore } from './authStore';
import {
  MMKV_CONVERSATIONS_KEY,
  MMKV_MESSAGES_PREFIX,
  MAX_CACHED_MESSAGES_PER_CONVERSATION,
} from '@utils/constants';
import type {
  Conversation,
  Message,
  SocketConnectionState,
  UserSearchResult,
} from '@appTypes/chat';

interface ChatServerState {
  conversations: Conversation[];
  conversationsCursor: string | null;
  hasMoreConversations: boolean;
  isLoadingConversations: boolean;
}

interface MessagesState {
  messagesByConversation: Record<string, Message[]>;
  cursorByConversation: Record<string, string | null>;
  hasMoreByConversation: Record<string, boolean>;
  isLoadingMessages: boolean;
  isLoadingMoreMessages: boolean;
}

interface ChatUIState {
  activeConversationId: string | null;
  typingByConversation: Record<string, boolean>;
  socketState: SocketConnectionState;
  unreadCountByConversation: Record<string, number>;
}

interface SearchState {
  searchResults: UserSearchResult[];
  searchQuery: string;
  isSearching: boolean;
  searchError: string | null;
  recentSearches: UserSearchResult[];
}

interface ChatActions {
  connectSocket: () => void;
  disconnectSocket: () => void;
  setActiveConversation: (conversationId: string | null) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  retryFailedMessage: (conversationId: string, message: Message) => Promise<void>;
  setSearchQuery: (query: string) => void;
  searchUsers: (query: string, signal?: AbortSignal) => Promise<void>;
  clearSearch: () => void;
  addRecentSearch: (user: UserSearchResult) => void;
  hydrateFromCache: () => void;
  markConversationRead: (conversationId: string) => void;
}

type ChatStore = ChatServerState & MessagesState & ChatUIState & SearchState & ChatActions;

export const useChatStore = create<ChatStore>()((set, get) => ({
  conversations: [],
  conversationsCursor: null,
  hasMoreConversations: true,
  isLoadingConversations: false,

  messagesByConversation: {},
  cursorByConversation: {},
  hasMoreByConversation: {},
  isLoadingMessages: false,
  isLoadingMoreMessages: false,

  activeConversationId: null,
  typingByConversation: {},
  socketState: 'disconnected',
  unreadCountByConversation: {},

  searchResults: [],
  searchQuery: '',
  isSearching: false,
  searchError: null,
  recentSearches: [],

  hydrateFromCache: () => {
    const CHAT_CACHE_VERSION = 3;
    const currentVersion = getItem<number>('chat_cache_version');
    if (currentVersion !== CHAT_CACHE_VERSION) {
      setItem(MMKV_CONVERSATIONS_KEY, []);
      setItem('chat_cache_version', CHAT_CACHE_VERSION);
      set({ conversations: [] });
      return;
    }
    const currentUser = useAuthStore.getState().user;
    const userId = currentUser?.id || (currentUser as any)?._id || 'anon';
    const cachedSearches = getItem<UserSearchResult[]>(`${MMKV_RECENT_SEARCHES_KEY}_${userId}`) || [];

    const cached = getItem<Conversation[]>(MMKV_CONVERSATIONS_KEY);
    if (cached) {
      set({ conversations: cached, recentSearches: cachedSearches });
    } else {
      set({ recentSearches: cachedSearches });
    }
  },

  connectSocket: () => {
    set({ socketState: 'connecting' });
    socketClient.connect();

    chatSocket.onNewMessage((message) => {
      set(state => {
        const convId = message.conversationId;
        const existing = state.messagesByConversation[convId] ?? [];
        const isDuplicate = existing.some(m => m.id === message.id);
        if (isDuplicate) return state;

        const updatedMessages = [...existing, message];
        const persistSlice = updatedMessages.slice(-MAX_CACHED_MESSAGES_PER_CONVERSATION);
        setItem(`${MMKV_MESSAGES_PREFIX}${convId}`, persistSlice);

        const updatedConversations = state.conversations.map(c =>
          c.id === convId ? { ...c, lastMessage: message } : c,
        );

        const unreadDelta = state.activeConversationId === convId ? 0 : 1;

        return {
          messagesByConversation: { ...state.messagesByConversation, [convId]: updatedMessages },
          conversations: updatedConversations,
          unreadCountByConversation: {
            ...state.unreadCountByConversation,
            [convId]: (state.unreadCountByConversation[convId] ?? 0) + unreadDelta,
          },
        };
      });
    });

    chatSocket.onTyping((event) => {
      set(state => ({
        typingByConversation: {
          ...state.typingByConversation,
          [event.conversationId]: event.isTyping,
        },
      }));
    });

    chatSocket.onPresenceChange((event) => {
      set(state => ({
        conversations: state.conversations.map(c => {
          const isParticipant = c.participants.some(p => p.id === event.userId);
          return isParticipant ? { ...c, isOnline: event.isOnline } : c;
        }),
      }));
    });

    chatSocket.onReadReceipt((event) => {
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [event.conversationId]: (state.messagesByConversation[event.conversationId] ?? []).map(
            m => event.messageIds.includes(m.id) ? { ...m, status: 'read' as const } : m,
          ),
        },
      }));
    });

    set({ socketState: 'connected' });
  },

  disconnectSocket: () => {
    chatSocket.removeAllChatListeners();
    socketClient.disconnect();
    set({ socketState: 'disconnected' });
  },

  setActiveConversation: (conversationId) => {
    const prev = get().activeConversationId;
    if (prev) chatSocket.leaveConversation(prev);
    if (conversationId) chatSocket.joinConversation(conversationId);
    set({ activeConversationId: conversationId });
    if (conversationId) get().markConversationRead(conversationId);
  },

  loadConversations: async () => {
    const { isLoadingConversations } = get();
    if (isLoadingConversations) return;

    get().hydrateFromCache();
    set({ isLoadingConversations: true });
    try {
      const page = await chatApi.fetchConversations(null);
      set({
        conversations: page.conversations,
        conversationsCursor: page.nextCursor,
        hasMoreConversations: page.hasMore,
        isLoadingConversations: false,
      });
      setItem(MMKV_CONVERSATIONS_KEY, page.conversations);
    } catch {
      set({ isLoadingConversations: false });
    }
  },

  loadMessages: async (conversationId) => {
    const cachedMessages = getItem<Message[]>(`${MMKV_MESSAGES_PREFIX}${conversationId}`);
    if (cachedMessages) {
      set(state => ({
        messagesByConversation: { ...state.messagesByConversation, [conversationId]: cachedMessages },
      }));
    }

    set({ isLoadingMessages: true });
    try {
      const page = await chatApi.fetchMessages(conversationId, null);
      const persistSlice = page.messages.slice(-MAX_CACHED_MESSAGES_PER_CONVERSATION);
      setItem(`${MMKV_MESSAGES_PREFIX}${conversationId}`, persistSlice);
      set(state => ({
        messagesByConversation: { ...state.messagesByConversation, [conversationId]: page.messages },
        cursorByConversation: { ...state.cursorByConversation, [conversationId]: page.nextCursor },
        hasMoreByConversation: { ...state.hasMoreByConversation, [conversationId]: page.hasMore },
        isLoadingMessages: false,
      }));
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  loadMoreMessages: async (conversationId) => {
    const { isLoadingMoreMessages, cursorByConversation, hasMoreByConversation } = get();
    if (isLoadingMoreMessages || !hasMoreByConversation[conversationId]) return;

    set({ isLoadingMoreMessages: true });
    try {
      const cursor = cursorByConversation[conversationId] ?? null;
      const page = await chatApi.fetchMessages(conversationId, cursor);
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...page.messages, ...(state.messagesByConversation[conversationId] ?? [])],
        },
        cursorByConversation: { ...state.cursorByConversation, [conversationId]: page.nextCursor },
        hasMoreByConversation: { ...state.hasMoreByConversation, [conversationId]: page.hasMore },
        isLoadingMoreMessages: false,
      }));
    } catch {
      set({ isLoadingMoreMessages: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    const currentUser = useAuthStore.getState().user;
    const localId = `local-${Date.now()}-${Math.random()}`;
    const optimisticMessage: Message = {
      id: localId,
      conversationId,
      sender: {
        id: currentUser?.id || 'me',
        username: currentUser?.username || 'me',
        profilePicture: currentUser?.profilePicture || '',
      },
      content,
      status: 'sending',
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set(state => {
      const existing = state.messagesByConversation[conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...existing, optimisticMessage],
        },
      };
    });

    try {
      const serverMessage = await chatApi.sendMessage(conversationId, content, localId);
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (state.messagesByConversation[conversationId] ?? []).map(m =>
            m.id === localId ? { ...serverMessage, isOptimistic: false } : m,
          ),
        },
      }));
    } catch {
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (state.messagesByConversation[conversationId] ?? []).map(m =>
            m.id === localId ? { ...m, status: 'failed' as const } : m,
          ),
        },
      }));
    }
  },

  retryFailedMessage: async (conversationId, message) => {
    set(state => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map(m =>
          m.id === message.id ? { ...m, status: 'sending' as const } : m,
        ),
      },
    }));

    try {
      const serverMessage = await chatApi.sendMessage(conversationId, message.content, message.id);
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (state.messagesByConversation[conversationId] ?? []).map(m =>
            m.id === message.id ? { ...serverMessage, isOptimistic: false } : m,
          ),
        },
      }));
    } catch {
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (state.messagesByConversation[conversationId] ?? []).map(m =>
            m.id === message.id ? { ...m, status: 'failed' as const } : m,
          ),
        },
      }));
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  searchUsers: async (query, signal) => {
    set({ isSearching: true, searchError: null });
    try {
      const response = await chatApi.searchUsers(query, null);
      if (!signal?.aborted) {
        set({ searchResults: response.users, isSearching: false });
      }
    } catch (error) {
      if (!signal?.aborted) {
        const message = error instanceof Error ? error.message : 'Search failed';
        set({ searchError: message, isSearching: false, searchResults: [] });
      }
    }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [], searchError: null, isSearching: false }),

  addRecentSearch: (user) => {
    const currentUser = useAuthStore.getState().user;
    const userId = currentUser?.id || (currentUser as any)?._id || 'anon';
    set(state => {
      const filtered = state.recentSearches.filter(u => u.id !== user.id);
      const updated = [user, ...filtered].slice(0, 10);
      setItem(`${MMKV_RECENT_SEARCHES_KEY}_${userId}`, updated);
      return { recentSearches: updated };
    });
  },

  markConversationRead: (conversationId) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
      unreadCountByConversation: { ...state.unreadCountByConversation, [conversationId]: 0 },
    }));
  },
}));

export const selectConversations = (s: ChatStore) => s.conversations;
export const selectActiveConversationId = (s: ChatStore) => s.activeConversationId;
export const selectSocketState = (s: ChatStore) => s.socketState;
export const selectSearchResults = (s: ChatStore) => s.searchResults;
export const selectIsSearching = (s: ChatStore) => s.isSearching;
export const selectRecentSearches = (s: ChatStore) => s.recentSearches;
export const selectMessagesForConversation = (id: string) => (s: ChatStore) =>
  s.messagesByConversation[id] ?? [];
export const selectTypingForConversation = (id: string) => (s: ChatStore) =>
  s.typingByConversation[id] ?? false;
export const selectHasMoreMessages = (id: string) => (s: ChatStore) =>
  s.hasMoreByConversation[id] ?? false;
