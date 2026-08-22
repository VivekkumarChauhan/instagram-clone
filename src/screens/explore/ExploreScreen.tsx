import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { THEME } from '@utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 4) / 3;

interface ExploreItem {
  id: string;
  imageUrl: string;
  isReel: boolean;
  views?: string;
  tag: string;
}

import { useReelsStore } from '@store/reelsStore';

const CATEGORIES = ['All', 'Reels', 'Trending', 'Creators'];

export const ExploreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const reels = useReelsStore(s => s.reels);

  const filteredReels = reels.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.caption.toLowerCase().includes(q) || item.author.username.toLowerCase().includes(q);
  });

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Reels')}
        style={styles.cell}
      >
        <Image
          source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.reelBadge}>
          <FontAwesome5 name="play" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.viewsText}>{item.likesCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={THEME.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search creators, reels, trends..."
            placeholderTextColor={THEME.colors.textSecondary}
            style={styles.searchInput}
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredReels}
        numColumns={3}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyExplore}>
            <Ionicons name="compass-outline" size={54} color={THEME.colors.textMuted} />
            <Text style={styles.emptyExploreTitle}>Discover Creators</Text>
            <Text style={styles.emptyExploreSubtitle}>Trending reels will appear here once uploaded</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceInput,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
  },
  categoriesContainer: {
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.colors.border,
  },
  categoriesList: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.radius.pill,
    backgroundColor: THEME.colors.surfaceCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  categoryChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  categoryChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gridContent: {
    paddingTop: 2,
  },
  cell: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.3,
    margin: 0.6,
    position: 'relative',
    backgroundColor: THEME.colors.surfaceCard,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  reelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyExplore: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyExploreTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyExploreSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
});
