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

const CATEGORIES = ['All', 'Trending', 'Art', 'Travel', 'Music', 'Gaming', 'Fashion'];

const MOCK_EXPLORE_ITEMS: ExploreItem[] = [
  { id: 'e1', imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500', isReel: true, views: '1.2M', tag: 'Trending' },
  { id: 'e2', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', isReel: false, tag: 'Travel' },
  { id: 'e3', imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500', isReel: false, tag: 'Travel' },
  { id: 'e4', imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500', isReel: false, tag: 'Art' },
  { id: 'e5', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500', isReel: true, views: '840K', tag: 'Trending' },
  { id: 'e6', imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500', isReel: false, tag: 'Art' },
  { id: 'e7', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500', isReel: false, tag: 'Travel' },
  { id: 'e8', imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500', isReel: true, views: '2.5M', tag: 'Fashion' },
  { id: 'e9', imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500', isReel: false, tag: 'Music' },
  { id: 'e10', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500', isReel: false, tag: 'Gaming' },
  { id: 'e11', imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500', isReel: true, views: '450K', tag: 'Trending' },
  { id: 'e12', imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=500', isReel: false, tag: 'Art' },
];

export const ExploreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = MOCK_EXPLORE_ITEMS.filter(item => {
    if (selectedCategory !== 'All' && item.tag !== selectedCategory) return false;
    if (searchQuery.trim() && !item.tag.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const renderItem = ({ item }: { item: ExploreItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Reels')}
        style={styles.cell}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        {item.isReel && (
          <View style={styles.reelBadge}>
            <FontAwesome5 name="play" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
            {item.views && <Text style={styles.viewsText}>{item.views}</Text>}
          </View>
        )}
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
        data={filteredItems}
        numColumns={3}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
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
});
