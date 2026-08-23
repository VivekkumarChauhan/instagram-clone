import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ViewToken,
  StatusBar,
  FlatList,
} from 'react-native';
import { ReelItem } from '@components/reels/ReelItem';
import { Loader } from '@components/common/Loader';
import { NetworkBanner } from '@components/common/NetworkBanner';
import {
  useReelsStore,
  selectReels,
  selectCurrentIndex,
  selectIsMuted,
  selectIsReelsLoading,
  selectReelsError,
} from '@store/reelsStore';
import { useNetwork } from '@hooks/useNetwork';
import { useAppState } from '@hooks/useAppState';
import type { Reel } from '@appTypes/reels';

import { useNavigation, useIsFocused, useRoute, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '@appTypes/navigation';
import { Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@utils/constants';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const ReelsScreen: React.FC = () => {
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT - 60);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Reels'>>();
  const isFocused = useIsFocused();
  const reels = useReelsStore(selectReels);
  const currentIndex = useReelsStore(selectCurrentIndex);
  const isMuted = useReelsStore(selectIsMuted);
  const isLoading = useReelsStore(selectIsReelsLoading);
  const error = useReelsStore(selectReelsError);
  const loadInitialReels = useReelsStore(s => s.loadInitialReels);
  const setCurrentIndex = useReelsStore(s => s.setCurrentIndex);
  const toggleMute = useReelsStore(s => s.toggleMute);
  const checkAndFetchMore = useReelsStore(s => s.checkAndFetchMore);

  const { isOnline } = useNetwork();
  const listRef = useRef<FlatList<Reel>>(null);

  useEffect(() => {
    loadInitialReels();
  }, [loadInitialReels]);

  // Synchronize FlatList scroll position to target index when screen gains focus
  useEffect(() => {
    const targetIdx = route.params?.initialIndex !== undefined ? route.params.initialIndex : currentIndex;
    if (isFocused && reels.length > 0 && targetIdx >= 0 && targetIdx < reels.length) {
      setCurrentIndex(targetIdx);
      const timer = setTimeout(() => {
        try {
          listRef.current?.scrollToIndex({ index: targetIdx, animated: false });
        } catch (_) {
          listRef.current?.scrollToOffset({ offset: targetIdx * containerHeight, animated: false });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isFocused, route.params?.initialIndex, reels.length, containerHeight]);

  useAppState(
    useCallback(() => {
      if (isOnline) loadInitialReels();
    }, [isOnline, loadInitialReels]),
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
        const newIndex = viewableItems[0].index;
        setCurrentIndex(newIndex);
        checkAndFetchMore(newIndex);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: Reel; index: number }) => (
      <View style={{ width: SCREEN_WIDTH, height: containerHeight }}>
        <ReelItem
          reel={item}
          isActive={isFocused && index === currentIndex}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      </View>
    ),
    [isFocused, currentIndex, isMuted, toggleMute, containerHeight],
  );

  const keyExtractor = useCallback((item: Reel) => item.id, []);

  if (isLoading && reels.length === 0) {
    return <Loader fullScreen message="Loading reels..." />;
  }

  if (!isLoading && reels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Icon name="film-outline" size={64} color="#737373" />
        <Text style={styles.emptyTitle}>No Reels Yet</Text>
        <Text style={styles.emptySubtitle}>
          Be the first to create and share a reel with the community!
        </Text>
        <TouchableOpacity
          style={styles.emptyCreateBtn}
          onPress={() => navigation.navigate('Create')}
        >
          <Icon name="add" size={20} color="#FFFFFF" />
          <Text style={styles.emptyCreateBtnText}>Create a Reel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={e => {
        const { height } = e.nativeEvent.layout;
        if (height > 0) setContainerHeight(height);
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <NetworkBanner />
      <FlatList
        ref={listRef}
        data={reels}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialScrollIndex={currentIndex > 0 && currentIndex < reels.length ? currentIndex : undefined}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 100);
        }}
        getItemLayout={(_, index) => ({
          length: containerHeight,
          offset: containerHeight * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#A8A8A8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
  },
  emptyCreateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
