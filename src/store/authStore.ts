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
        set({ status: 'loading', error: null });
        try {
          const session = await authApi.login(request);
          saveTokens(session.tokens.accessToken, session.tokens.refreshToken);
          set({ user: session.user, status: 'authenticated', error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ status: 'unauthenticated', error: message });
          throw error;
        }
      },

      signUp: async (request) => {
        set({ status: 'loading', isLoading: true, error: null });
        try {
          const result = await authApi.signUp(request);
          set({ status: 'unauthenticated', isLoading: false, error: null });
          return { email: result.email, otp: (result as any).otpPreview || (result as any).otp };
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
          if (res.token) {
            saveTokens(res.token, res.token);
          }
          const verifiedUser: User = res.user || {
            id: 'user-001',
            email: email,
            username: email.split('@')[0],
            fullName: email.split('@')[0],
            profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            bio: 'Welcome to my Lumigram profile ✨',
            followersCount: 1240,
            followingCount: 380,
            postsCount: 12,
            isVerified: true,
          };
          set({ user: verifiedUser, status: 'authenticated', isLoading: false, error: null });
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
