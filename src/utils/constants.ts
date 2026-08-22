import { API_BASE_URL, SOCKET_URL } from '../config';
export { API_BASE_URL, SOCKET_URL };

export const REELS_PAGE_SIZE = 5;
export const REELS_PREFETCH_THRESHOLD = 3;
export const MESSAGES_PAGE_SIZE = 20;

export const SEARCH_DEBOUNCE_MS = 500;
export const SEARCH_MIN_CHARS = 2;
export const TYPING_INDICATOR_TIMEOUT_MS = 3000;

export const SOCKET_RECONNECT_ATTEMPTS = 5;
export const SOCKET_RECONNECT_DELAY_MS = 2000;

export const MMKV_AUTH_KEY = 'auth_state';
export const MMKV_REELS_KEY = 'reels_cache';
export const MMKV_REELS_PAGINATION_KEY = 'reels_pagination';
export const MMKV_CONVERSATIONS_KEY = 'conversations_cache';
export const MMKV_MESSAGES_PREFIX = 'messages_';
export const MMKV_USER_PREFS_KEY = 'user_preferences';
export const MMKV_RECENT_SEARCHES_KEY = 'recent_searches';

export const MAX_RECENT_SEARCHES = 10;
export const MAX_CACHED_MESSAGES_PER_CONVERSATION = 50;

export const TOKEN_EXPIRY_BUFFER_MS = 60_000;
export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 60;

export const APP_NAME = 'Lumigram';
export const COMPANY_NAME = 'LUMIX';

export const COLORS = {
  background: '#000000',
  surface: '#121212',
  surfaceLight: '#262626',
  surfaceInput: '#1A1A1A',
  border: '#262626',
  borderLight: '#363636',
  textPrimary: '#FFFFFF',
  textSecondary: '#A8A8A8',
  textMuted: '#737373',
  primary: '#0095F6',
  like: '#FF3040',
  online: '#10B981',
  storyGradient: ['#FEE440', '#F77737', '#FD1D1D', '#E1306C', '#C13584', '#833AB4'] as const,
  seenStoryRing: ['#3A3A3A', '#3A3A3A'] as const,
  logoGradient: ['#FEE440', '#FF5400', '#E1006A', '#7209B7'] as const,
};
