import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage, setItem, getItem } from '@utils/mmkvStorage';
import { reelsApi } from '@services/api/reelsApi';
import {
  REELS_PAGE_SIZE,
  REELS_PREFETCH_THRESHOLD,
  MMKV_REELS_KEY,
  MMKV_REELS_PAGINATION_KEY,
} from '@utils/constants';

// Bump this when video URLs change to auto-clear stale cached data
const CACHE_VERSION = 3;
const MMKV_CACHE_VERSION_KEY = 'reels_cache_version';
import type {
  Reel,
  ReelsPaginationState,
  ReelUIState,
  ReelsServerState,
  VideoPlaybackState,
} from '@appTypes/reels';

interface ReelsStore extends ReelsServerState, ReelUIState {
  pagination: ReelsPaginationState;

  loadInitialReels: () => Promise<void>;
  fetchMoreReels: () => Promise<void>;
  refreshReels: () => Promise<void>;
  toggleLike: (reelId: string) => void;
  toggleFollow: (userId: string) => void;
  setCurrentIndex: (index: number) => void;
  toggleMute: () => void;
  setPlaybackState: (reelId: string, state: VideoPlaybackState) => void;
  checkAndFetchMore: (currentIndex: number) => void;
  hydrateFromCache: () => void;
}

const DEFAULT_PAGINATION: ReelsPaginationState = {
  nextCursor: null,
  hasMore: true,
  isFetchingMore: false,
  lastFetchedAt: null,
};

const DEFAULT_REELS: Reel[] = [];

const DEFAULT_UI: ReelUIState = {
  currentIndex: 0,
  isMuted: false,
  playbackStates: {},
};

export const useReelsStore = create<ReelsStore>()(
  persist(
    (set, get) => ({
      reels: DEFAULT_REELS,
      isLoading: false,
      isRefreshing: false,
      error: null,
      pagination: DEFAULT_PAGINATION,
      ...DEFAULT_UI,

      hydrateFromCache: () => {
        // Cache-bust: if version changed, clear stale data
        const storedVersion = getItem<number>(MMKV_CACHE_VERSION_KEY);
        if (storedVersion !== CACHE_VERSION) {
          setItem(MMKV_REELS_KEY, null);
          setItem(MMKV_REELS_PAGINATION_KEY, null);
          setItem(MMKV_CACHE_VERSION_KEY, CACHE_VERSION);
          console.log('[ReelsStore] Cache version changed — cleared stale reels cache');
          return;
        }
        const cached = getItem<Reel[]>(MMKV_REELS_KEY);
        const pagination = getItem<ReelsPaginationState>(MMKV_REELS_PAGINATION_KEY);
        if (cached && cached.length > 0) {
          set({ reels: cached });
        }
        if (pagination) {
          set({ pagination });
        }
      },

      loadInitialReels: async () => {
        const { isLoading, pagination } = get();
        if (isLoading) return;

        get().hydrateFromCache();

        set({ isLoading: true, error: null });
        try {
          const page = await reelsApi.fetchReels(null, REELS_PAGE_SIZE);
          const newPagination: ReelsPaginationState = {
            nextCursor: page.nextCursor,
            hasMore: page.hasMore,
            isFetchingMore: false,
            lastFetchedAt: new Date().toISOString(),
          };
          set({ reels: page.reels, isLoading: false, pagination: newPagination });
          setItem(MMKV_REELS_KEY, page.reels);
          setItem(MMKV_REELS_PAGINATION_KEY, newPagination);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load reels';
          set({ isLoading: false, error: message });
        }
      },

      fetchMoreReels: async () => {
        const { pagination, isLoading } = get();
        if (!pagination.hasMore || pagination.isFetchingMore || isLoading) return;

        set(state => ({ pagination: { ...state.pagination, isFetchingMore: true } }));
        try {
          const page = await reelsApi.fetchReels(pagination.nextCursor, REELS_PAGE_SIZE);
          const newPagination: ReelsPaginationState = {
            nextCursor: page.nextCursor,
            hasMore: page.hasMore,
            isFetchingMore: false,
            lastFetchedAt: new Date().toISOString(),
          };

          set(state => {
            const existingIds = new Set(state.reels.map(r => r.id));
            const uniqueNewReels = page.reels.filter(r => !existingIds.has(r.id));
            const updatedReels = [...state.reels, ...uniqueNewReels];
            setItem(MMKV_REELS_KEY, updatedReels);
            setItem(MMKV_REELS_PAGINATION_KEY, newPagination);
            return { reels: updatedReels, pagination: newPagination };
          });
        } catch {
          set(state => ({ pagination: { ...state.pagination, isFetchingMore: false } }));
        }
      },

      refreshReels: async () => {
        const { isRefreshing } = get();
        if (isRefreshing) return;

        set({ isRefreshing: true, error: null });
        try {
          const page = await reelsApi.fetchReels(null, REELS_PAGE_SIZE);
          const newPagination: ReelsPaginationState = {
            nextCursor: page.nextCursor,
            hasMore: page.hasMore,
            isFetchingMore: false,
            lastFetchedAt: new Date().toISOString(),
          };
          set({ reels: page.reels, isRefreshing: false, currentIndex: 0, pagination: newPagination });
          setItem(MMKV_REELS_KEY, page.reels);
          setItem(MMKV_REELS_PAGINATION_KEY, newPagination);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to refresh reels';
          set({ isRefreshing: false, error: message });
        }
      },

      toggleLike: (reelId) => {
        set(state => {
          const reels = state.reels.map(r => {
            if (r.id !== reelId) return r;
            const newIsLiked = !r.isLiked;
            return {
              ...r,
              isLiked: newIsLiked,
              likesCount: newIsLiked ? r.likesCount + 1 : r.likesCount - 1,
            };
          });
          setItem(MMKV_REELS_KEY, reels);
          return { reels };
        });
        const reel = get().reels.find(r => r.id === reelId);
        if (reel) {
          reelsApi.likeReel(reelId, !reel.isLiked).catch(() => {
            set(state => ({
              reels: state.reels.map(r =>
                r.id === reelId
                  ? { ...r, isLiked: reel.isLiked, likesCount: reel.likesCount }
                  : r,
              ),
            }));
          });
        }
      },

      toggleFollow: (userId) => {
        set(state => ({
          reels: state.reels.map(r =>
            r.author.id === userId
              ? { ...r, author: { ...r.author, isFollowing: !r.author.isFollowing } }
              : r,
          ),
        }));
        const reel = get().reels.find(r => r.author.id === userId);
        if (reel) {
          reelsApi.followUser(userId, !reel.author.isFollowing).catch(() => {
            set(state => ({
              reels: state.reels.map(r =>
                r.author.id === userId
                  ? { ...r, author: { ...r.author, isFollowing: reel.author.isFollowing } }
                  : r,
              ),
            }));
          });
        }
      },

      setCurrentIndex: (index) => set({ currentIndex: index }),
      toggleMute: () => set(state => ({ isMuted: !state.isMuted })),

      setPlaybackState: (reelId, playbackState) =>
        set(state => ({
          playbackStates: { ...state.playbackStates, [reelId]: playbackState },
        })),

      checkAndFetchMore: (currentIndex) => {
        const { reels, pagination } = get();
        const threshold = reels.length - REELS_PREFETCH_THRESHOLD;
        if (currentIndex >= threshold && pagination.hasMore && !pagination.isFetchingMore) {
          get().fetchMoreReels();
        }
      },
    }),
    {
      name: 'reels-ui-prefs',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({ isMuted: state.isMuted }),
    },
  ),
);

export const selectReels = (s: ReelsStore) => s.reels;
export const selectCurrentIndex = (s: ReelsStore) => s.currentIndex;
export const selectIsMuted = (s: ReelsStore) => s.isMuted;
export const selectIsReelsLoading = (s: ReelsStore) => s.isLoading;
export const selectReelsPagination = (s: ReelsStore) => s.pagination;
export const selectReelsError = (s: ReelsStore) => s.error;
export const selectPlaybackState = (reelId: string) => (s: ReelsStore) => s.playbackStates[reelId];
