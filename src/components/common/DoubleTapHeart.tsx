import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

interface DoubleTapHeartProps {
  visible?: boolean;
  onDoubleTap?: () => void;
  children?: React.ReactNode;
}

export const DoubleTapHeart: React.FC<DoubleTapHeartProps> = ({
  visible: controlledVisible,
  onDoubleTap,
  children,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef<number>(0);

  const isVisible = controlledVisible !== undefined ? controlledVisible : internalVisible;

  const triggerAnimation = () => {
    setInternalVisible(true);
    scale.setValue(0.3);
    opacity.setValue(1);

    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.25,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.delay(400),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setInternalVisible(false));
  };

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      triggerAnimation();
      onDoubleTap?.();
    }
    lastTapRef.current = now;
  };

  const heartOverlay = (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[{ transform: [{ scale }], opacity }]}>
        <FontAwesome5 name="heart" size={90} color="#FF0055" solid />
      </Animated.View>
    </View>
  );

  if (children) {
    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={{ position: 'relative' }}>
          {children}
          {isVisible && heartOverlay}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  if (!isVisible) return null;

  return heartOverlay;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
