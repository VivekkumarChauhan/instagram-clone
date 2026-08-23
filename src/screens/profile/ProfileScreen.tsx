import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '@store/authStore';
import { THEME } from '@utils/theme';
import type { MainTabScreenProps } from '@appTypes/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 36) / 3;

const MOCK_GRID_PHOTOS = [
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
];

const HIGHLIGHTS = [
  { id: 'h1', title: 'Tokyo 🌸', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200' },
  { id: 'h2', title: 'Vibes 🎧', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200' },
  { id: 'h3', title: 'Coast 🌊', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
  { id: 'h4', title: 'Trips 🏔️', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200' },
];

import { useReelsStore } from '@store/reelsStore';

export const ProfileScreen: React.FC<MainTabScreenProps<'Profile'>> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('grid');
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const reels = useReelsStore(s => s.reels);

  const myReels = reels.filter(r => r.author.id === user?.id || r.author.username === user?.username);

  const displayUser = {
    username: user?.username || 'User',
    fullName: user?.fullName || user?.username || 'Lumigram User',
    avatar: user?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    bio: user?.bio || 'Welcome to my Lumigram ✨',
    postsCount: user?.postsCount ?? myReels.length,
    followersCount: user?.followersCount ?? 0,
    followingCount: user?.followingCount ?? 0,
    isVerified: user?.isVerified ?? false,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

      <View style={styles.topBar}>
        <View style={styles.usernameHeaderRow}>
          <FontAwesome5 name="lock" size={12} color={THEME.colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.topUsername}>{displayUser.username}</Text>
          {displayUser.isVerified && (
            <FontAwesome5 name="check-circle" size={13} color={THEME.colors.accent} solid style={{ marginLeft: 4 }} />
          )}
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome5 name="plus-square" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome5 name="bars" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarGlowContainer}>
              <LinearGradient
                colors={[...THEME.colors.gradients.aurora]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
              >
                <Image
                  source={{ uri: displayUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                  style={styles.avatarImage}
                />
              </LinearGradient>
              <View style={styles.onlineBadge}>
                <FontAwesome5 name="bolt" size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{displayUser.postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {displayUser.followersCount > 1000
                    ? `${(displayUser.followersCount / 1000).toFixed(1)}k`
                    : displayUser.followersCount}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{displayUser.followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.fullName}>{displayUser.fullName}</Text>
            <Text style={styles.bioText}>{displayUser.bio}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionPill} activeOpacity={0.8}>
              <FontAwesome5 name="user-edit" size={13} color={THEME.colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={styles.actionPillText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionPill} activeOpacity={0.8}>
              <FontAwesome5 name="share-alt" size={13} color={THEME.colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={styles.actionPillText}>Share Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.highlightsContainer}>
          <Text style={styles.sectionTitle}>Story Highlights</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsList}>
            {HIGHLIGHTS.map(h => (
              <TouchableOpacity key={h.id} style={styles.highlightItem} activeOpacity={0.8}>
                <LinearGradient
                  colors={[...THEME.colors.gradients.brand]}
                  style={styles.highlightRing}
                >
                  <Image source={{ uri: h.image }} style={styles.highlightImage} />
                </LinearGradient>
                <Text style={styles.highlightTitle}>{h.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'grid' && styles.tabBtnActive]}
            onPress={() => setActiveTab('grid')}
          >
            <FontAwesome5
              name="th"
              size={18}
              color={activeTab === 'grid' ? THEME.colors.primaryGlow : THEME.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'reels' && styles.tabBtnActive]}
            onPress={() => setActiveTab('reels')}
          >
            <FontAwesome5
              name="play"
              size={16}
              color={activeTab === 'reels' ? THEME.colors.primaryGlow : THEME.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'tagged' && styles.tabBtnActive]}
            onPress={() => setActiveTab('tagged')}
          >
            <FontAwesome5
              name="user-tag"
              size={16}
              color={activeTab === 'tagged' ? THEME.colors.primaryGlow : THEME.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {myReels.length > 0 ? (
            myReels.map((reel) => (
              <TouchableOpacity
                key={reel.id}
                style={styles.gridItem}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Reels')}
              >
                <Image
                  source={{ uri: reel.thumbnailUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400' }}
                  style={styles.gridImage}
                />
                <View style={styles.gridReelBadge}>
                  <FontAwesome5 name="play" size={10} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyGridBox}>
              <FontAwesome5 name="film" size={32} color={THEME.colors.textMuted} />
              <Text style={styles.emptyGridText}>No reels or posts yet</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => logout()}
          style={styles.logoutWrapper}
        >
          <LinearGradient
            colors={['#FF0055', '#D00040']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutBtn}
          >
            <FontAwesome5 name="sign-out-alt" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out of Lumigram</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.colors.border,
  },
  usernameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topUsername: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.lg,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarGlowContainer: {
    position: 'relative',
  },
  avatarRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    ...THEME.shadows.glowBrand,
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: THEME.colors.surface,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.primary,
    borderWidth: 2,
    borderColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginLeft: 16,
    backgroundColor: THEME.colors.surfaceInput,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.border,
  },
  bioSection: {
    marginTop: 14,
  },
  fullName: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  bioText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionPill: {
    flex: 1,
    height: 38,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPillText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  highlightsContainer: {
    marginTop: 16,
    paddingHorizontal: 14,
  },
  sectionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  highlightsList: {
    gap: 14,
  },
  highlightItem: {
    alignItems: 'center',
    width: 64,
  },
  highlightRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2.5,
  },
  highlightImage: {
    width: 53,
    height: 53,
    borderRadius: 26.5,
  },
  highlightTitle: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  tabSelector: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: THEME.colors.border,
    marginTop: 18,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.primaryGlow,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: THEME.radius.sm,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridReelBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  emptyGridBox: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyGridText: {
    color: THEME.colors.textMuted,
    fontSize: 14,
  },
  logoutWrapper: {
    marginHorizontal: 12,
    marginTop: 24,
  },
  logoutBtn: {
    height: 48,
    borderRadius: THEME.radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
