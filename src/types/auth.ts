export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose: 'forgot_password' | 'email_verification';
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
