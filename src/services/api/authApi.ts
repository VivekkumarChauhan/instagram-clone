import apiClient from './apiClient';
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
    const response = await apiClient.post<AuthSession>('/auth/login', request);
    return response.data;
  },

  signUp: async (request: SignUpRequest): Promise<{ email: string; message: string; otp?: string }> => {
    const response = await apiClient.post<{ email: string; message: string; otp?: string }>('/auth/signup', request);
    return response.data;
  },

  forgotPassword: async (request: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', request);
    return response.data;
  },

  verifyOTP: async (request: VerifyOTPRequest): Promise<{ verified: boolean; token?: string; user?: User; tokens?: any }> => {
    const response = await apiClient.post<{ verified: boolean; token?: string; user?: User; tokens?: any }>('/auth/verify-otp', request);
    return response.data;
  },

  resetPassword: async (request: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', request);
    return response.data;
  },

  updateProfile: async (request: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.post<{ user: User }>('/auth/create-profile', request);
    return response.data.user;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // offline logout is ok
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    const response = await apiClient.post<{ accessToken: string; expiresIn: number }>('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  },
};
