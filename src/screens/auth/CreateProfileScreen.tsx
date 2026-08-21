import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { useAuth } from '@hooks/useAuth';
import { validateUsername, validateName } from '@utils/validationUtils';
import type { AuthScreenProps } from '@appTypes/navigation';

type Props = AuthScreenProps<'CreateProfile'>;

export const CreateProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { updateProfile, isLoading, error } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture] = useState('https://i.pravatar.cc/150?img=1');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validate = (): boolean => {
    const newErrors = {
      fullName: validateName(fullName),
      username: validateUsername(username),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(e => e === null);
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await updateProfile({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        profilePicture,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {}
  };

  return (
    <LinearGradient colors={['#000000', '#0d0010', '#000000']} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Set Up Profile</Text>
          <Text style={styles.subtitle}>Tell people who you are.</Text>

          <View style={styles.avatarContainer}>
            <Image source={{ uri: profilePicture }} style={styles.avatar} />
            <TouchableOpacity style={styles.changePhoto}>
              <Text style={styles.changePhotoText}>Change photo</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            error={errors.fullName}
          />

          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. john_doe"
            autoCapitalize="none"
            error={errors.username}
          />

          <Input
            label="Bio (optional)"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell something about yourself..."
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top', paddingTop: 10 }}
          />

          <Button
            title="Save Profile"
            onPress={handleSave}
            isLoading={isLoading}
            style={styles.saveBtn}
          />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 32, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { color: '#8E8E93', fontSize: 14, marginBottom: 32 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#E1306C' },
  changePhoto: { marginTop: 12 },
  changePhotoText: { color: '#E1306C', fontSize: 14, fontWeight: '500' },
  errorBanner: {
    backgroundColor: '#3A0010',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E1306C',
  },
  errorBannerText: { color: '#FF6B8A', fontSize: 13 },
  saveBtn: { marginTop: 8, marginBottom: 16 },
  skipText: { color: '#8E8E93', fontSize: 14, textAlign: 'center' },
});
