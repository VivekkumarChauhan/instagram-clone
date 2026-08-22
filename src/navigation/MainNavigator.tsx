import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '@screens/feed/HomeScreen';
import { ExploreScreen } from '@screens/explore/ExploreScreen';
import { ReelsScreen } from '@screens/reels/ReelsScreen';
import { UploadReelScreen } from '@screens/reels/UploadReelScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import { ChatNavigator } from './ChatNavigator';
import { useAuthStore } from '@store/authStore';
import { COLORS } from '@utils/constants';
import type { MainTabParamList } from '@appTypes/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const user = useAuthStore(s => s.user);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#262626',
          borderTopWidth: 0.5,
          height: 48,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      {/* 1. Home Feed */}
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Explore / Search */}
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name={focused ? 'search' : 'search-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Create / Upload New Reel (+) */}
      <Tab.Screen
        name="Create"
        component={UploadReelScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.createIconWrapper}>
              <Icon
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={30}
                color="#FFFFFF"
              />
            </View>
          ),
        }}
      />

      {/* 4. Reels Player */}
      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name={focused ? 'film' : 'film-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 5. Direct Messages / Chat */}
      <Tab.Screen
        name="ChatTab"
        component={ChatNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.dmIconWrapper}>
              <Icon name="paper-plane-outline" size={24} color={color} />
              <View style={styles.dmRedDot} />
            </View>
          ),
        }}
      />

      {/* 6. Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.profileTabWrapper,
                focused && styles.profileTabActive,
              ]}
            >
              <Image
                source={{
                  uri:
                    user?.profilePicture ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                }}
                style={styles.profileTabAvatar}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  createIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dmIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dmRedDot: {
    position: 'absolute',
    bottom: -2,
    right: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3040',
  },
  profileTabWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTabActive: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileTabAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});
