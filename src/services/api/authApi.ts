import apiClient from './apiClient';
import { authMock } from '@services/mock/authMock';
import type {
  AuthSession,
  LoginRequest,
  SignUpRequest,
  ForgotPasswordRequest,
  VerifyOTPRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from '@appTypes/auth';

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthSession> => {
    try {
      const response = await apiClient.post<AuthSession>('/auth/login', request);
      return response.data;
    } catch (e) {
      return authMock.login(request);
    }
  },

  signUp: async (request: SignUpRequest): Promise<{ email: string; message: string; otp?: string; otpPreview?: string }> => {
    try {
      const response = await apiClient.post<{ email: string; message: string; otp?: string; otpPreview?: string }>('/auth/signup', request);
      return response.data;
    } catch (e) {
      return authMock.signUp(request);
    }
  },

  forgotPassword: async (request: ForgotPasswordRequest): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', request);
      return response.data;
    } catch (e) {
      return authMock.forgotPassword(request);
    }
  },

  verifyOTP: async (request: VerifyOTPRequest): Promise<{ verified: boolean; token?: string; user?: User }> => {
    try {
      const response = await apiClient.post<{ verified: boolean; token?: string; user?: User }>('/auth/verify-otp', request);
      return response.data;
    } catch (e) {
      return authMock.verifyOTP(request);
    }
  },

  resetPassword: async (request: ResetPasswordRequest): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', request);
      return response.data;
    } catch (e) {
      return authMock.resetPassword(request);
    }
  },

  updateProfile: async (request: UpdateProfileRequest): Promise<User> => {
    try {
      const response = await apiClient.post<{ user: User }>('/auth/create-profile', request);
      return response.data.user;
    } catch (e) {
      return authMock.updateProfile(request);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // offline logout
    }
    await authMock.logout();
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    try {
      const response = await apiClient.post<{ accessToken: string; expiresIn: number }>('/auth/refresh-token', { refreshToken });
      return response.data;
    } catch (e) {
      return authMock.refreshToken(refreshToken);
    }
  },
};
