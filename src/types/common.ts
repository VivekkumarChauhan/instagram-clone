export type NetworkStatus = 'online' | 'offline' | 'unknown';

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export type Theme = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: Theme;
  notificationsEnabled: boolean;
  autoPlayReels: boolean;
  defaultMuted: boolean;
}
