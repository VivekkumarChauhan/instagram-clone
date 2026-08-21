import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '@screens/auth/OnboardingScreen';
import { SplashScreen } from '@screens/auth/SplashScreen';
import { LoginScreen } from '@screens/auth/LoginScreen';
import { SignUpScreen } from '@screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '@screens/auth/ForgotPasswordScreen';
import { OTPVerificationScreen } from '@screens/auth/OTPVerificationScreen';
import { CreateProfileScreen } from '@screens/auth/CreateProfileScreen';
import type { AuthStackParamList } from '@appTypes/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Splash"
    screenOptions={{
      headerShown: false,
      animation: 'fade',
      contentStyle: { backgroundColor: '#08080A' },
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
  </Stack.Navigator>
);
