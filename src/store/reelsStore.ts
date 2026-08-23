import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage, setItem, getItem } from '@utils/mmkvStorage';
import { reelsApi } from '@services/api/reelsApi';
import { videoCacheService } from '@services/videoCacheService';
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
  videoCacheMap: Record<string, string>;

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
  cacheReelVideos: (reelsList: Reel[], priorityIndex?: number) => void;
}

const DEFAULT_SEED_REELS: Reel[] = [
  {
    id: 'seed-reel-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
    caption: 'Tokyo Cyberpunk Nights 🌸✨ #tokyo #cyberpunk #lumigram',
    likesCount: 1420,
    commentsCount: 88,
    isLiked: false,
    author: {
      id: 'lumix_official',
      username: 'lumix_japan',
      fullName: 'Lumix Tokyo',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      isVerified: true,
      isFollowing: false,
    },
    audioTitle: 'Tokyo Night Drive • Original Audio',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-reel-2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    caption: 'Lost in the mountains 🏔️ Adventure never stops! #explore',
    likesCount: 3820,
    commentsCount: 210,
    isLiked: true,
    author: {
      id: 'alex_travels',
      username: 'alex.adventures',
      fullName: 'Alex Vance',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      isVerified: true,
      isFollowing: true,
    },
    audioTitle: 'Mountain Air • Vance Beats',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-reel-3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600',
    caption: 'Golden hour sunset vibes by the beach 🌊🌅 #sunset #vibes',
    likesCount: 9540,
    commentsCount: 432,
    isLiked: false,
    author: {
      id: 'maya_sunset',
      username: 'maya.world',
      fullName: 'Maya Lin',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      isVerified: false,
      isFollowing: false,
    },
    audioTitle: 'Sunset Waves • Chillhop Vibes',
    createdAt: new Date().toISOString(),
  },
];

const getInitialReels = (): Reel[] => {
  try {
    const rawZustand = getItem<{ state?: { reels?: Reel[] } }>('lumigram-reels-storage');
    if (rawZustand?.state?.reels && Array.isArray(rawZustand.state.reels) && rawZustand.state.reels.length > 0) {
      return rawZustand.state.reels;
    }
    const cached = getItem<Reel[]>(MMKV_REELS_KEY);
    if (Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
  } catch {}
  // Persist default seed reels into MMKV immediately
  try {
    setItem(MMKV_REELS_KEY, DEFAULT_SEED_REELS);
  } catch {}
  return DEFAULT_SEED_REELS;
};

const getInitialPagination = (): ReelsPaginationState => {
  try {
    const rawZustand = getItem<{ state?: { pagination?: ReelsPaginationState } }>('lumigram-reels-storage');
    if (rawZustand?.state?.pagination) {
      return rawZustand.state.pagination;
    }
    const cached = getItem<ReelsPaginationState>(MMKV_REELS_PAGINATION_KEY);
    if (cached) return cached;
  } catch {}
  return {
    nextCursor: null,
    hasMore: true,
    isFetchingMore: false,
    lastFetchedAt: null,
  };
};

const getInitialVideoCacheMap = (): Record<string, string> => {
  try {
    const rawMap = videoCacheService.getCacheMap();
    const result: Record<string, string> = {};
    for (const [id, meta] of Object.entries(rawMap)) {
      if (meta && meta.localPath) {
        result[id] = meta.localPath;
      }
    }
    return result;
  } catch {
    return {};
  }
};

const DEFAULT_UI: ReelUIState = {
  currentIndex: 0,
  isMuted: false,
  playbackStates: {},
};

export const useReelsStore = create<ReelsStore>()(
  persist(
    (set, get) => ({
      reels: getInitialReels(),
      isLoading: false,
      isRefreshing: false,
      error: null,
      pagination: getInitialPagination(),
      videoCacheMap: getInitialVideoCacheMap(),
      ...DEFAULT_UI,

      hydrateFromCache: () => {
        const cached = getInitialReels();
        const pagination = getInitialPagination();
        const videoMap = getInitialVideoCacheMap();
        if (cached && cached.length > 0) {
          set({ reels: cached });
        }
        if (pagination) {
          set({ pagination });
        }
        if (videoMap) {
          set({ videoCacheMap: videoMap });
        }
      },

      cacheReelVideos: (reelsList: Reel[], priorityIndex: number = 0) => {
        if (!reelsList || reelsList.length === 0) return;

        // Order download priority: priorityIndex first, then next 1-2 reels
        const ordered = [...reelsList].sort((a, b) => {
          const idxA = reelsList.indexOf(a);
          const idxB = reelsList.indexOf(b);
          const distA = Math.abs(idxA - priorityIndex);
          const distB = Math.abs(idxB - priorityIndex);
          return distA - distB;
        });

        // Background download top 5 nearest reels
        ordered.slice(0, 5).forEach(reel => {
          if (reel.videoUrl && !get().videoCacheMap[reel.id]) {
            videoCacheService.downloadAndCacheVideo(reel.id, reel.videoUrl).then(localPath => {
              if (localPath && localPath.startsWith('file://')) {
                set(state => ({
                  videoCacheMap: { ...state.videoCacheMap, [reel.id]: localPath },
                }));
              }
            }).catch(() => {});
          }
        });
      },

      loadInitialReels: async () => {
        const { isLoading, reels } = get();
        if (isLoading) return;

        // Trigger background caching for existing reels immediately
        if (reels && reels.length > 0) {
          get().cacheReelVideos(reels, 0);
          return;
        }

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
          get().cacheReelVideos(page.reels, 0);
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
          get().cacheReelVideos(get().reels, get().currentIndex);
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
          get().cacheReelVideos(page.reels, 0);
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

      setCurrentIndex: (index) => {
        set({ currentIndex: index });
        get().cacheReelVideos(get().reels, index);
      },
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
      name: 'lumigram-reels-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({
        reels: state.reels,
        pagination: state.pagination,
        isMuted: state.isMuted,
      }),
    },
  ),
);

export const selectReels = (s: ReelsStore) => s.reels;
export const selectCurrentIndex = (s: ReelsStore) => s.currentIndex;
export const selectIsMuted = (s: ReelsStore) => s.isMuted;
export const selectIsReelsLoading = (s: ReelsStore) => s.isLoading;
export const selectReelsPagination = (s: ReelsStore) => s.pagination;
export const selectReelsError = (s: ReelsStore) => s.error;
export const selectVideoCacheMap = (s: ReelsStore) => s.videoCacheMap;
export const selectPlaybackState = (reelId: string) => (s: ReelsStore) => s.playbackStates[reelId];

