import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatListScreen } from '@screens/chat/ChatListScreen';
import { ChatDetailScreen } from '@screens/chat/ChatDetailScreen';
import { ChatSearchScreen } from '@screens/chat/ChatSearchScreen';
import type { ChatStackParamList } from '@appTypes/navigation';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export const ChatNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#000000' },
    }}
  >
    <Stack.Screen name="ChatList" component={ChatListScreen} />
    <Stack.Screen
      name="ChatDetail"
      component={ChatDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ChatSearch"
      component={ChatSearchScreen}
      options={{ animation: 'fade' }}
    />
  </Stack.Navigator>
);
