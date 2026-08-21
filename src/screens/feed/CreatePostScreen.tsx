import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@utils/constants';

export const CreatePostScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
          <Icon name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
          <Text style={styles.nextBtn}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.cameraPreviewBox}>
          <Icon name="camera-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.previewTitle}>Select a Photo or Video</Text>
          <Text style={styles.previewSubtitle}>Share your latest moments with friends</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Feed')}
            style={styles.openGalleryBtn}
          >
            <Icon name="images-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.openGalleryText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#262626',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nextBtn: {
    color: '#0095F6',
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cameraPreviewBox: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
    width: '100%',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  previewSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  openGalleryBtn: {
    backgroundColor: '#0095F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openGalleryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
