import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTPVerification: {
    email: string;
    purpose: 'forgot_password' | 'email_verification';
    receivedOtp?: string;
  };
  CreateProfile: { email: string; accessToken: string };
};

export type MainTabParamList = {
  Feed: undefined;
  Explore: undefined;
  Create: undefined;
  Reels: undefined;
  ChatTab: undefined;
  Profile: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: { conversationId: string; participantName: string; participantAvatar: string };
  ChatSearch: undefined;
};

export type AppStackParamList = {
  Auth: undefined;
  Main: undefined;
  DirectMessages: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type ChatScreenProps<T extends keyof ChatStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ChatStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;
