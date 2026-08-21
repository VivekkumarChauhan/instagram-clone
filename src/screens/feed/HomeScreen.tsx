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

const MOCK_STORIES: StoryUser[] = [
  { id: 's0', username: 'Your story', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', hasUnseen: false },
  { id: 's1', username: 'alex_photo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', hasUnseen: true },
  { id: 's2', username: 'elena_vibe', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', hasUnseen: true },
  { id: 's3', username: 'tokyo.lens', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', hasUnseen: true },
  { id: 's4', username: 'sarah.raw', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', hasUnseen: false },
  { id: 's5', username: 'neon.space', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200', hasUnseen: true },
];

const MOCK_FEED: FeedPost[] = [
  {
    id: 'p1',
    username: 'alex_photo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    isVerified: true,
    location: 'Shinjuku, Tokyo',
    mediaUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    likesCount: 14280,
    caption: 'Neon reflections after the rain in Shinjuku 🌧️✨ Shot on 35mm.',
    commentsCount: 342,
    timeAgo: '2h ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'p2',
    username: 'elena_vibe',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    isVerified: false,
    location: 'Amalfi Coast, Italy',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    likesCount: 28940,
    caption: 'Endless blue horizon and morning espresso ☕🌊 #summer #italy',
    commentsCount: 512,
    timeAgo: '5h ago',
    isLiked: true,
    isSaved: true,
  },
  {
    id: 'p3',
    username: 'tokyo.lens',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    isVerified: true,
    location: 'Kyoto, Japan',
    mediaUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    likesCount: 39510,
    caption: 'Quiet pathways before the city wakes up ⛩️🍂',
    commentsCount: 780,
    timeAgo: '9h ago',
    isLiked: false,
    isSaved: false,
  },
];

export const HomeScreen: React.FC<MainTabScreenProps<'Feed'>> = ({ navigation }) => {
  const [feed, setFeed] = useState<FeedPost[]>(MOCK_FEED);

  const toggleLike = (postId: string) => {
    setFeed(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: post.likesCount + (isLiked ? 1 : -1),
          };
        }
        return post;
      }),
    );
  };

  const toggleSave = (postId: string) => {
    setFeed(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return { ...post, isSaved: !post.isSaved };
        }
        return post;
      }),
    );
  };

  const renderStoriesTray = () => (
    <View style={styles.storiesContainer}>
      <FlatList
        data={MOCK_STORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.storiesList}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
            <View style={styles.storyRingWrapper}>
              <StoryRing
                uri={item.avatar}
                size={66}
                hasUnseen={item.hasUnseen}
              />
              {index === 0 && (
                <View style={styles.addStoryBadge}>
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.storyUsername} numberOfLines={1}>
              {item.username}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderPost = ({ item }: { item: FeedPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthorRow}>
          <Image source={{ uri: item.userAvatar }} style={styles.postAvatar} />
          <View style={styles.postAuthorMeta}>
            <View style={styles.usernameRow}>
              <Text style={styles.postUsername}>{item.username}</Text>
              {item.isVerified && (
                <FontAwesome5 name="check-circle" size={12} color={THEME.colors.accent} solid style={{ marginLeft: 4 }} />
              )}
            </View>
            {item.location ? <Text style={styles.postLocation}>{item.location}</Text> : null}
          </View>
        </View>
        <TouchableOpacity style={styles.postMenuBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <DoubleTapHeart onDoubleTap={() => toggleLike(item.id)}>
        <Image source={{ uri: item.mediaUrl }} style={styles.postMedia} resizeMode="cover" />
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
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome5 name="comment" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome5 name="paper-plane" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => toggleSave(item.id)}>
          <FontAwesome5
            name="bookmark"
            size={20}
            color={item.isSaved ? THEME.colors.accent : THEME.colors.textPrimary}
            solid={item.isSaved}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postMeta}>
        <Text style={styles.likesCount}>{item.likesCount.toLocaleString()} likes</Text>
        <View style={styles.captionRow}>
          <Text style={styles.captionText}>
            <Text style={styles.captionAuthor}>{item.username} </Text>
            {item.caption}
          </Text>
        </View>
        <TouchableOpacity style={styles.commentsLink}>
          <Text style={styles.commentsCountText}>View all {item.commentsCount} comments</Text>
        </TouchableOpacity>
        <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
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
          <TouchableOpacity style={styles.topIconBtn}>
            <FontAwesome5 name="plus-square" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topIconBtn}>
            <FontAwesome5 name="heart" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={() => navigation.navigate('ChatTab')}
          >
            <FontAwesome5 name="paper-plane" size={20} color={THEME.colors.textPrimary} />
            <View style={styles.unreadPulseDot} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={feed}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderStoriesTray}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
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
});
