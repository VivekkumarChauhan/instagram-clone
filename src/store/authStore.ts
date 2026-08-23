import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureZustandMMKVStorage } from '@utils/mmkvStorage';
import { saveTokens, clearTokens } from '@utils/tokenStorage';
import { authApi } from '@services/api/authApi';
import type { User, LoginRequest, SignUpRequest, UpdateProfileRequest, AuthStatus } from '@appTypes/auth';
import { MMKV_AUTH_KEY } from '@utils/constants';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  isLoading?: boolean;
  error: string | null;
}

interface AuthActions {
  login: (request: LoginRequest) => Promise<void>;
  signUp: (request: SignUpRequest) => Promise<{ email: string; otp?: string }>;
  verifyOTP: (request: { email: string; otp: string; purpose?: string }) => Promise<void>;
  forgotPassword: (request: { email: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (request: UpdateProfileRequest) => Promise<void>;
  clearError: () => void;
  setStatus: (status: AuthStatus) => void;
  hydrateSession: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'idle',
      isLoading: false,
      error: null,

      hydrateSession: () => {
        const { user } = get();
        if (user) {
          set({ status: 'authenticated' });
          return true;
        }
        set({ status: 'unauthenticated' });
        return false;
      },

      login: async (request) => {
        set({ status: 'loading', isLoading: true, error: null });
        try {
          const session = await authApi.login(request);
          saveTokens(session.tokens.accessToken, session.tokens.refreshToken);
          try {
            const { useChatStore } = require('./chatStore');
            useChatStore.getState().reset();
          } catch (_) {}
          set({ user: session.user, status: 'authenticated', isLoading: false, error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ status: 'unauthenticated', isLoading: false, error: message });
          throw error;
        }
      },

      signUp: async (request) => {
        set({ status: 'loading', isLoading: true, error: null });
        try {
          const result = await authApi.signUp(request);
          set({ status: 'unauthenticated', isLoading: false, error: null });
          return { email: result.email, otp: (result as any).previewOtp || (result as any).otpPreview || (result as any).otp };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign up failed';
          set({ status: 'unauthenticated', isLoading: false, error: message });
          throw error;
        }
      },

      verifyOTP: async ({ email, otp, purpose = 'email_verification' }) => {
        set({ status: 'loading', isLoading: true, error: null });
        try {
          const res = await authApi.verifyOTP({ email, otp, purpose: purpose as any });
          if (res.tokens) {
            saveTokens(res.tokens.accessToken, res.tokens.refreshToken);
          } else if (res.token) {
            saveTokens(res.token, res.token);
          }
          try {
            const { useChatStore } = require('./chatStore');
            useChatStore.getState().reset();
          } catch (_) {}
          if (res.user) {
            set({ user: res.user, status: 'authenticated', isLoading: false, error: null });
          } else {
            set({ status: 'unauthenticated', isLoading: false, error: null });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Verification failed';
          set({ status: 'unauthenticated', isLoading: false, error: message });
          throw error;
        }
      },

      forgotPassword: async ({ email }) => {
        set({ status: 'loading', isLoading: true, error: null });
        try {
          await authApi.forgotPassword({ email });
          set({ status: 'unauthenticated', isLoading: false, error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send OTP';
          set({ status: 'unauthenticated', isLoading: false, error: message });
          throw error;
        }
      },

      logout: async () => {
        set({ status: 'loading', isLoading: true });
        try {
          await authApi.logout();
        } finally {
          clearTokens();
          try {
            const { useChatStore } = require('./chatStore');
            useChatStore.getState().reset();
          } catch (_) {}
          set({ user: null, status: 'unauthenticated', isLoading: false, error: null });
        }
      },

      updateProfile: async (request) => {
        set({ error: null });
        try {
          const updatedUser = await authApi.updateProfile(request);
          set({ user: updatedUser });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Update failed';
          set({ error: message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: MMKV_AUTH_KEY,
      storage: createJSONStorage(() => secureZustandMMKVStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const selectUser = (state: AuthStore) => state.user;
export const selectAuthStatus = (state: AuthStore) => state.status;
export const selectAuthError = (state: AuthStore) => state.error;
export const selectIsAuthenticated = (state: AuthStore) => state.status === 'authenticated' || Boolean(state.user);
