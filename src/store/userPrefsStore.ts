import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@utils/mmkvStorage';
import { MMKV_USER_PREFS_KEY } from '@utils/constants';
import type { UserPreferences, Theme } from '@appTypes/common';

interface UserPrefsStore extends UserPreferences {
  setTheme: (theme: Theme) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAutoPlayReels: (autoPlay: boolean) => void;
  setDefaultMuted: (muted: boolean) => void;
}

export const useUserPrefsStore = create<UserPrefsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      notificationsEnabled: true,
      autoPlayReels: true,
      defaultMuted: false,

      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setAutoPlayReels: (autoPlay) => set({ autoPlayReels: autoPlay }),
      setDefaultMuted: (muted) => set({ defaultMuted: muted }),
    }),
    {
      name: MMKV_USER_PREFS_KEY,
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
