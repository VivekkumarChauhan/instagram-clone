import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { THEME } from '@utils/theme';
import type { Reel } from '@appTypes/reels';

interface Props {
  reel: Reel;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onFollow: () => void;
  onUserPress?: () => void;
  onMuteToggle?: () => void;
  isMuted?: boolean;
}

export const ReelOverlay: React.FC<Props> = ({
  reel,
  onLike,
  onComment,
  onShare,
  onFollow,
  onUserPress = () => {},
  onMuteToggle,
  isMuted = false,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <LinearGradient
        colors={['transparent', 'rgba(4,4,7,0.4)', 'rgba(4,4,7,0.95)']}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      <View style={styles.contentRow} pointerEvents="box-none">
        <View style={styles.leftInfo} pointerEvents="box-none">
          <View style={styles.authorRow}>
            <TouchableOpacity
              onPress={onUserPress}
              style={styles.avatarBtn}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: reel.author.profilePicture }}
                style={styles.avatar}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={onUserPress} activeOpacity={0.8}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{reel.author.username}</Text>
                {reel.author.isVerified && (
                  <FontAwesome5
                    name="check-circle"
                    size={13}
                    color={THEME.colors.accent}
                    solid
                    style={{ marginLeft: 5 }}
                  />
                )}
              </View>
            </TouchableOpacity>

            {!reel.author.isFollowing && (
              <TouchableOpacity
                onPress={onFollow}
                style={styles.followBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.followBtnText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.caption} numberOfLines={2}>
            {reel.caption}
          </Text>

          <View style={styles.audioRow}>
            <FontAwesome5
              name="music"
              size={11}
              color={THEME.colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.audioText} numberOfLines={1}>
              {reel.audioName || 'Original Audio • Lumigram Track'}
            </Text>
          </View>
        </View>

        <View style={styles.rightActionRail} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.actionItem}
            onPress={onLike}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, reel.isLiked && styles.actionIconCircleLiked]}>
              <FontAwesome5
                name="heart"
                size={22}
                color={reel.isLiked ? '#FF0055' : '#FFFFFF'}
                solid={reel.isLiked}
              />
            </View>
            <Text style={styles.actionCount}>
              {reel.likesCount > 1000
                ? `${(reel.likesCount / 1000).toFixed(1)}k`
                : reel.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={onComment}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconCircle}>
              <FontAwesome5 name="comment" size={21} color="#FFFFFF" solid />
            </View>
            <Text style={styles.actionCount}>{reel.commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={onShare}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconCircle}>
              <FontAwesome5 name="paper-plane" size={19} color="#FFFFFF" solid />
            </View>
            <Text style={styles.actionCount}>{reel.sharesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
            <LinearGradient
              colors={[...THEME.colors.gradients.aurora]}
              style={styles.musicDisc}
            >
              <Image
                source={{ uri: reel.author.profilePicture }}
                style={styles.discThumb}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  leftInfo: {
    flex: 1,
    marginRight: 16,
    gap: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.colors.accent,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  followBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 13.5,
    lineHeight: 19,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  audioText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  rightActionRail: {
    alignItems: 'center',
    gap: 16,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(20,20,30,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionIconCircleLiked: {
    backgroundColor: 'rgba(255, 0, 85, 0.18)',
    borderColor: '#FF0055',
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  musicDisc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  discThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});
