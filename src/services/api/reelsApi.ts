import apiClient from './apiClient';
import type { ReelsPage } from '@appTypes/reels';

export const reelsApi = {
  fetchReels: async (cursor: string | null, limit?: number): Promise<ReelsPage> => {
    const response = await apiClient.get<ReelsPage>('/reels', {
      params: { cursor, limit: limit ?? 5 },
    });
    return response.data || { reels: [], nextCursor: null, hasMore: false };
  },

  likeReel: async (reelId: string, isLiked: boolean): Promise<void> => {
    await apiClient.post(`/reels/${reelId}/like`, { isLiked });
  },

  followUser: async (userId: string, isFollowing: boolean): Promise<void> => {
    await apiClient.post(`/users/${userId}/follow`, { isFollowing });
  },
};
