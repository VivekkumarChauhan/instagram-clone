import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { THEME } from '@utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: readonly [string, string, ...string[]];
  image: string;
}

const CARDS: OnboardingCard[] = [
  {
    id: 'c1',
    title: 'Express Your Vision',
    subtitle: 'Share immersive stories, high-definition reels, and connect with creative minds worldwide.',
    icon: 'camera',
    gradient: THEME.colors.gradients.sunset,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
  },
  {
    id: 'c2',
    title: 'Next-Gen Reels Experience',
    subtitle: 'Watch and create seamless vertical video feeds powered by 2026 gesture interactions.',
    icon: 'film',
    gradient: THEME.colors.gradients.brand,
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
  },
  {
    id: 'c3',
    title: 'Real-Time Direct Pulse',
    subtitle: 'Instant messaging, live typing presence, voice notes, and seamless media sharing.',
    icon: 'chatbubbles',
    gradient: THEME.colors.gradients.cyber,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
  },
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < CARDS.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      navigation.navigate('SignUp');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

      <View style={styles.topHeader}>
        <LinearGradient
          colors={[...THEME.colors.gradients.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBadge}
        >
          <Icon name="sparkles" size={18} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.brandTitle}>LUMIGRAM</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={CARDS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(8,8,10,0.85)', '#08080A']}
                style={styles.cardGradient}
              />
              <View style={styles.cardContent}>
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Icon name={item.icon} size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomSection}>
        <View style={styles.paginationRow}>
          {CARDS.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={styles.actionBtnWrapper}
        >
          <LinearGradient
            colors={[...THEME.colors.gradients.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>
              {activeIndex === CARDS.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Icon name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLinkBtn}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkHighlight}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 2,
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.54,
    borderRadius: THEME.radius.xl,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...THEME.shadows.glowPrimary,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    backgroundColor: THEME.colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: THEME.colors.borderLight,
  },
  actionBtnWrapper: {
    width: '100%',
  },
  primaryBtn: {
    height: 52,
    borderRadius: THEME.radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginLinkBtn: {
    marginTop: 16,
    padding: 6,
  },
  loginLinkText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: THEME.colors.accent,
    fontWeight: '700',
  },
});
