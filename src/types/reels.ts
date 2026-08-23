export interface ReelAuthor {
  id: string;
  username: string;
  fullName?: string;
  profilePicture: string;
  isVerified: boolean;
  isFollowing: boolean;
}

export interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  author: ReelAuthor;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  isLiked: boolean;
  duration?: number;
  createdAt: string;
  audioName?: string;
  audioTitle?: string;
}

export interface ReelsPage {
  reels: Reel[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ReelsPaginationState {
  nextCursor: string | null;
  hasMore: boolean;
  isFetchingMore: boolean;
  lastFetchedAt: string | null;
}

export type VideoPlaybackState = 'playing' | 'paused' | 'loading' | 'error' | 'ended';

export interface ReelUIState {
  currentIndex: number;
  isMuted: boolean;
  playbackStates: Record<string, VideoPlaybackState>;
}

export interface LikeReelRequest {
  reelId: string;
  isLiked: boolean;
}

export interface FollowUserRequest {
  userId: string;
  isFollowing: boolean;
}

export interface ReelsServerState {
  reels: Reel[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}
