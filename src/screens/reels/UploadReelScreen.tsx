import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Video from 'react-native-video';
import { uploadApi } from '@services/api/uploadApi';
import { useReelsStore } from '@store/reelsStore';
import { COLORS } from '@utils/constants';
import type { MainTabScreenProps } from '@appTypes/navigation';

export const UploadReelScreen: React.FC<MainTabScreenProps<'Create'>> = ({ navigation }) => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [audioName, setAudioName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadInitialReels = useReelsStore((s) => s.loadInitialReels);

  const handlePickVideo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'high',
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick video from gallery');
    }
  };

  const handleRecordVideo = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'video',
        videoQuality: 'high',
        cameraType: 'back',
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const handlePublish = async () => {
    if (!videoUri) {
      Alert.alert('Select Video', 'Please select or record a video first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get signed signature
      const sigData = await uploadApi.getUploadSignature();

      // 2. Upload direct to Cloudinary with progress
      const uploadRes = await uploadApi.uploadVideoToCloudinary(
        videoUri,
        sigData,
        (progress) => setUploadProgress(progress)
      );

      // 3. Create reel in MongoDB
      await uploadApi.createReel({
        videoUrl: uploadRes.secure_url,
        thumbnailUrl: uploadRes.thumbnail_url,
        publicId: uploadRes.public_id,
        caption: caption.trim(),
        audioName: audioName.trim() || 'Original Audio',
      });

      // 4. Refresh reels feed
      await loadInitialReels();

      Alert.alert('Success 🎉', 'Your reel has been published!', [
        {
          text: 'View Reels',
          onPress: () => {
            setVideoUri(null);
            setCaption('');
            setAudioName('');
            setIsUploading(false);
            setUploadProgress(0);
            navigation.navigate('Reels');
          },
        },
      ]);
    } catch (error: any) {
      setIsUploading(false);
      Alert.alert('Upload Failed', error?.message || 'Could not upload reel. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (!isUploading) navigation.goBack();
          }}
          disabled={isUploading}
          style={styles.headerButton}
        >
          <Icon name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Reel</Text>
        <TouchableOpacity
          onPress={handlePublish}
          disabled={!videoUri || isUploading}
          style={[styles.publishButton, (!videoUri || isUploading) && styles.publishButtonDisabled]}
        >
          {isUploading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.publishButtonText}>{uploadProgress}%</Text>
            </View>
          ) : (
            <Text style={styles.publishButtonText}>Upload</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Video Preview or Selector */}
        {videoUri ? (
          <View style={styles.previewContainer}>
            <Video
              source={{ uri: videoUri }}
              style={styles.previewVideo}
              resizeMode="cover"
              repeat
              muted
              paused={false}
              useTextureView={Platform.OS === 'android'}
            />
            <TouchableOpacity
              style={styles.changeVideoButton}
              onPress={handlePickVideo}
              disabled={isUploading}
            >
              <Icon name="sync-outline" size={18} color="#FFFFFF" />
              <Text style={styles.changeVideoText}>Change Video</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerBox}>
            <Icon name="videocam-outline" size={60} color="#737373" />
            <Text style={styles.pickerTitle}>Create an Instagram Reel</Text>
            <Text style={styles.pickerSubtitle}>
              Upload a vertical 9:16 video to share with the community
            </Text>

            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handlePickVideo}>
                <Icon name="images-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handleRecordVideo}>
                <Icon name="camera-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Record Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>Uploading to Cloudinary... {uploadProgress}%</Text>
          </View>
        )}

        {/* Caption & Metadata Input */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption... #trending #reel"
            placeholderTextColor="#737373"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
            editable={!isUploading}
          />

          <Text style={styles.inputLabel}>Audio Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Original Audio • Artist Name"
            placeholderTextColor="#737373"
            value={audioName}
            onChangeText={setAudioName}
            maxLength={60}
            editable={!isUploading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#262626',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  publishButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  pickerBox: {
    backgroundColor: '#121212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262626',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  pickerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  pickerSubtitle: {
    color: '#A8A8A8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  pickerActions: {
    width: '100%',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnSecondary: {
    backgroundColor: '#262626',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  previewContainer: {
    width: '100%',
    height: 380,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#121212',
    position: 'relative',
    marginVertical: 12,
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  changeVideoButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  changeVideoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: '#262626',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    color: '#A8A8A8',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 12,
    gap: 8,
  },
  inputLabel: {
    color: '#A8A8A8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  captionInput: {
    backgroundColor: '#121212',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262626',
    color: '#FFFFFF',
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  textInput: {
    backgroundColor: '#121212',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262626',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
});
