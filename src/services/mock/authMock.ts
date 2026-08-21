import { mockDelay, mockFailWithProbability } from '@utils/mockDelay';
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

const mockUser: User = {
  id: 'user-001',
  username: 'johndoe',
  fullName: 'John Doe',
  email: 'john@example.com',
  profilePicture: 'https://i.pravatar.cc/150?img=1',
  bio: 'Living my best life 📸',
  followersCount: 1247,
  followingCount: 384,
  postsCount: 56,
  isVerified: false,
};

const mockSession: AuthSession = {
  user: mockUser,
  tokens: {
    accessToken: 'mock-access-token-xyz-123',
    refreshToken: 'mock-refresh-token-abc-456',
    expiresIn: 3600,
  },
};

export const authMock = {
  async login(request: LoginRequest): Promise<AuthSession> {
    await mockDelay();
    if (request.email === 'fail@test.com') {
      throw new Error('Invalid email or password');
    }
    return { ...mockSession, user: { ...mockUser, email: request.email } };
  },

  async signUp(request: SignUpRequest): Promise<{ email: string; message: string; otp?: string; otpPreview?: string }> {
    await mockDelay();
    if (request.email === 'exists@test.com') {
      throw new Error('An account with this email already exists');
    }
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    return {
      email: request.email,
      message: 'Verification email sent',
      otp: randomOtp,
      otpPreview: randomOtp,
    };
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    await mockDelay();
    return { message: 'OTP sent to your email address' };
  },

  async verifyOTP(request: VerifyOTPRequest): Promise<{ verified: boolean; token?: string; user?: User }> {
    await mockDelay();
    if (request.otp === '000000') {
      throw new Error('Invalid or expired OTP');
    }
    return {
      verified: true,
      token: 'mock-verified-token-123456',
      user: {
        ...mockUser,
        email: request.email,
        username: request.email.split('@')[0],
      },
    };
  },

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    await mockDelay();
    return { message: 'Password reset successfully' };
  },

  async updateProfile(request: UpdateProfileRequest): Promise<User> {
    await mockDelay();
    return { ...mockUser, ...request };
  },

  async logout(): Promise<void> {
    await mockDelay(100, 200);
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    await mockDelay(100, 300);
    return { accessToken: 'mock-refreshed-access-token', expiresIn: 3600 };
  },
};
