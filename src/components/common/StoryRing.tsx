import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from '@utils/theme';

interface StoryRingProps {
  uri?: string;
  size?: number;
  hasStory?: boolean;
  hasUnseen?: boolean;
  isSeen?: boolean;
  isUserStory?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const StoryRing: React.FC<StoryRingProps> = ({
  uri,
  size = 66,
  hasStory = true,
  hasUnseen = true,
  isSeen = false,
  isUserStory = false,
  onPress,
  children,
}) => {
  const ringPadding = 2.5;
  const innerSpacing = 2.5;
  const ringSize = size + ringPadding * 2 + innerSpacing * 2;

  const content = children || (
    uri ? (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    ) : null
  );

  const shouldShowGradient = hasStory && (hasUnseen || !isSeen);
  const gradientColors = shouldShowGradient
    ? [...THEME.colors.gradients.storyActive]
    : [...THEME.colors.gradients.storySeen];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.container, { width: ringSize, height: ringSize }]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 1 }}
        end={{ x: 0.9, y: 0.1 }}
        style={[
          styles.gradientRing,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
          },
        ]}
      >
        <View
          style={[
            styles.innerGap,
            {
              width: size + innerSpacing * 2,
              height: size + innerSpacing * 2,
              borderRadius: (size + innerSpacing * 2) / 2,
            },
          ]}
        >
          {content}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerGap: {
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
