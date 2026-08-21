import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { authApi } from '@services/api/authApi';
import { validateEmail } from '@utils/validationUtils';
import type { AuthScreenProps } from '@appTypes/navigation';

type Props = AuthScreenProps<'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    setIsLoading(true);
    setApiError(null);
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      navigation.navigate('OTPVerification', {
        email: email.trim().toLowerCase(),
        purpose: 'forgot_password',
      });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#0d0010', '#000000']} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter the email associated with your account and we'll send an OTP to reset your password.
          </Text>

          {apiError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{apiError}</Text>
            </View>
          )}

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <Button
            title="Send OTP"
            onPress={handleSubmit}
            isLoading={isLoading}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 32, paddingTop: 60 },
  backButton: { marginBottom: 24 },
  backText: { color: '#E1306C', fontSize: 15 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  subtitle: { color: '#8E8E93', fontSize: 14, lineHeight: 20, marginBottom: 32 },
  errorBanner: {
    backgroundColor: '#3A0010',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E1306C',
  },
  errorBannerText: { color: '#FF6B8A', fontSize: 13 },
  button: { marginTop: 8 },
});
