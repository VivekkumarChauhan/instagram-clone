import apiClient from './apiClient';
import { reelsMock } from '@services/mock/reelsMock';
import type { ReelsPage } from '@appTypes/reels';

export const reelsApi = {
  fetchReels: async (cursor: string | null, limit?: number): Promise<ReelsPage> => {
    try {
      const response = await apiClient.get<ReelsPage>('/reels', {
        params: { cursor, limit: limit ?? 5 },
      });
      if (response.data && response.data.reels && response.data.reels.length > 0) {
        return response.data;
      }
      return reelsMock.fetchReels(cursor, limit);
    } catch (e) {
      return reelsMock.fetchReels(cursor, limit);
    }
  },

  likeReel: async (reelId: string, isLiked: boolean): Promise<void> => {
    try {
      await apiClient.post(`/reels/${reelId}/like`, { isLiked });
    } catch (e) {
      await reelsMock.likeReel(reelId, isLiked);
    }
  },

  followUser: async (userId: string, isFollowing: boolean): Promise<void> => {
    try {
      await apiClient.post(`/users/${userId}/follow`, { isFollowing });
    } catch (e) {
      await reelsMock.followUser(userId, isFollowing);
    }
  },
};
