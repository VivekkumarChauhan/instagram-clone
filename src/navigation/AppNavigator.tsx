import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { ChatNavigator } from './ChatNavigator';
import { useAuthStore, selectIsAuthenticated, selectAuthStatus } from '@store/authStore';
import { Loader } from '@components/common/Loader';
import type { AppStackParamList } from '@appTypes/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

const darkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#08080A',
    card: '#08080A',
    text: '#FFFFFF',
    border: '#1E1E28',
    primary: '#6C5CE7',
  },
};

export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const status = useAuthStore(selectAuthStatus);

  if (status === 'idle') {
    return <Loader fullScreen />;
  }

  return (
    <NavigationContainer theme={darkNavTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#08080A' },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="DirectMessages"
              component={ChatNavigator}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

