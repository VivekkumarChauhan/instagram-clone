import apiClient from './apiClient';
import type { User } from '@appTypes/auth';

export const userApi = {
  getProfile: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/search', { params: { q: query } });
    return response.data;
  },
};
