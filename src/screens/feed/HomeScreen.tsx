import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StoryRing } from '@components/common/StoryRing';
import { DoubleTapHeart } from '@components/common/DoubleTapHeart';
import { THEME } from '@utils/theme';
import type { MainTabScreenProps } from '@appTypes/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoryUser {
  id: string;
  username: string;
  avatar: string;
  hasUnseen: boolean;
}

interface FeedPost {
  id: string;
  username: string;
  userAvatar: string;
  isVerified: boolean;
  location: string;
  mediaUrl: string;
  likesCount: number;
  caption: string;
  commentsCount: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

import { useAuthStore } from '@store/authStore';
import { useReelsStore } from '@store/reelsStore';

export const HomeScreen: React.FC<MainTabScreenProps<'Feed'>> = ({ navigation }) => {
  const user = useAuthStore(s => s.user);
  const reels = useReelsStore(s => s.reels);
  const toggleLike = useReelsStore(s => s.toggleLike);
  const loadInitialReels = useReelsStore(s => s.loadInitialReels);
  const setCurrentIndex = useReelsStore(s => s.setCurrentIndex);

  React.useEffect(() => {
    loadInitialReels();
  }, [loadInitialReels]);

  const renderStoriesTray = () => (
    <View style={styles.storiesContainer}>
      <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
        <View style={styles.storyRingWrapper}>
          <StoryRing
            uri={user?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            size={66}
            hasUnseen={false}
          />
          <View style={styles.addStoryBadge}>
            <Ionicons name="add" size={14} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.storyUsername} numberOfLines={1}>
          Your story
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPost = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthorRow}>
          <Image
            source={{ uri: item.author.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
            style={styles.postAvatar}
          />
          <View style={styles.postAuthorMeta}>
            <View style={styles.usernameRow}>
              <Text style={styles.postUsername}>{item.author.username}</Text>
              {item.author.isVerified && (
                <FontAwesome5 name="check-circle" size={12} color={THEME.colors.accent} solid style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={styles.postLocation}>Reel</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.postMenuBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <DoubleTapHeart onDoubleTap={() => toggleLike(item.id)}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setCurrentIndex(index);
            navigation.navigate('Reels');
          }}
        >
          <Image
            source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400' }}
            style={styles.postMedia}
            resizeMode="cover"
          />
          <View style={styles.playOverlayBadge}>
            <FontAwesome5 name="play" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </DoubleTapHeart>

      <View style={styles.postActionsBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.actionBtn}>
            <FontAwesome5
              name="heart"
              size={22}
              color={item.isLiked ? THEME.colors.secondary : THEME.colors.textPrimary}
              solid={item.isLiked}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Reels')}>
            <FontAwesome5 name="comment" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ChatTab')}>
            <FontAwesome5 name="paper-plane" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.postMeta}>
        <Text style={styles.likesCount}>{item.likesCount.toLocaleString()} likes</Text>
        <View style={styles.captionRow}>
          <Text style={styles.captionText}>
            <Text style={styles.captionAuthor}>{item.author.username} </Text>
            {item.caption}
          </Text>
        </View>
        <Text style={styles.timeAgoText}>{item.audioName || 'Original Audio'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <LinearGradient
            colors={[...THEME.colors.gradients.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandLogoIcon}
          >
            <FontAwesome5 name="bolt" size={14} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.brandWordmark}>LUMIGRAM</Text>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.topIconBtn} onPress={() => navigation.navigate('Create')}>
            <FontAwesome5 name="plus-square" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={() => navigation.navigate('ChatTab')}
          >
            <FontAwesome5 name="paper-plane" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={reels}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderStoriesTray}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyFeedBox}>
            <Ionicons name="sparkles-outline" size={48} color={THEME.colors.accent} />
            <Text style={styles.emptyFeedTitle}>Welcome to Lumigram</Text>
            <Text style={styles.emptyFeedSubtitle}>
              Be the first to share a vertical reel with your community!
            </Text>
            <TouchableOpacity
              style={styles.emptyFeedBtn}
              onPress={() => navigation.navigate('Create')}
            >
              <FontAwesome5 name="plus" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyFeedBtnText}>Create Reel</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandWordmark: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 2,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  topIconBtn: {
    position: 'relative',
    padding: 4,
  },
  unreadPulseDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.secondary,
  },
  feedContent: {
    paddingBottom: 24,
  },
  storiesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.colors.border,
  },
  storiesList: {
    paddingHorizontal: 12,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  storyRingWrapper: {
    position: 'relative',
  },
  addStoryBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary,
    borderWidth: 2,
    borderColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyUsername: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  postCard: {
    marginTop: 12,
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.lg,
    marginHorizontal: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  postAuthorMeta: {
    justifyContent: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUsername: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  postLocation: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  postMenuBtn: {
    padding: 6,
  },
  postMedia: {
    width: '100%',
    height: SCREEN_WIDTH * 0.92,
    backgroundColor: THEME.colors.surface,
  },
  postActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    padding: 2,
  },
  postMeta: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  likesCount: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  captionRow: {
    marginBottom: 6,
  },
  captionText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  captionAuthor: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  commentsLink: {
    marginBottom: 4,
  },
  commentsCountText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  timeAgoText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playOverlayBadge: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFeedBox: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyFeedTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyFeedSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyFeedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyFeedBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
