import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '@store/authStore';
import { THEME } from '@utils/theme';
import type { AuthScreenProps } from '@appTypes/navigation';

type Props = AuthScreenProps<'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [focusField, setFocusField] = useState<string | null>(null);

  const signUp = useAuthStore(s => s.signUp);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const handleSignUp = async () => {
    if (!email.trim() || !username.trim() || !password) return;
    try {
      const res = await signUp({
        email: email.trim(),
        username: username.trim(),
        fullName: fullName.trim(),
        password,
      });
      navigation.navigate('OTPVerification', {
        email: email.trim(),
        purpose: 'email_verification',
        receivedOtp: res?.otp,
      });
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

      <LinearGradient
        colors={[...THEME.colors.gradients.aurora]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.backgroundGlow}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <LinearGradient
              colors={[...THEME.colors.gradients.brand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <FontAwesome5 name="user-plus" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.brandTitle}>Create Account</Text>
            <Text style={styles.brandTagline}>Join millions creating on Lumigram</Text>
          </View>

          <View style={styles.glassCard}>
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#FF4D4D" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={[styles.inputWrapper, focusField === 'email' && styles.inputWrapperFocused]}>
              <FontAwesome5
                name="envelope"
                size={16}
                color={focusField === 'email' ? THEME.colors.accent : THEME.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={THEME.colors.textMuted}
                value={email}
                onChangeText={t => {
                  setEmail(t);
                  if (error) clearError();
                }}
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={[styles.inputWrapper, focusField === 'username' && styles.inputWrapperFocused]}>
              <FontAwesome5
                name="at"
                size={16}
                color={focusField === 'username' ? THEME.colors.accent : THEME.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={THEME.colors.textMuted}
                value={username}
                onChangeText={t => {
                  setUsername(t);
                  if (error) clearError();
                }}
                onFocus={() => setFocusField('username')}
                onBlur={() => setFocusField(null)}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrapper, focusField === 'fullName' && styles.inputWrapperFocused]}>
              <FontAwesome5
                name="id-card"
                size={16}
                color={focusField === 'fullName' ? THEME.colors.accent : THEME.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name (Optional)"
                placeholderTextColor={THEME.colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusField('fullName')}
                onBlur={() => setFocusField(null)}
              />
            </View>

            <View style={[styles.inputWrapper, focusField === 'password' && styles.inputWrapperFocused]}>
              <FontAwesome5
                name="lock"
                size={16}
                color={focusField === 'password' ? THEME.colors.accent : THEME.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password (min. 6 chars)"
                placeholderTextColor={THEME.colors.textMuted}
                value={password}
                onChangeText={t => {
                  setPassword(t);
                  if (error) clearError();
                }}
                onFocus={() => setFocusField('password')}
                onBlur={() => setFocusField(null)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={THEME.colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={isLoading || !email.trim() || !username.trim() || !password}
              style={[
                styles.signupBtn,
                (!email.trim() || !username.trim() || !password) && styles.btnDisabled,
              ]}
            >
              <LinearGradient
                colors={[...THEME.colors.gradients.brand]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signupGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.signupBtnText}>Continue to Verification</Text>
                    <FontAwesome5 name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By signing up, you agree to our <Text style={styles.termsLink}>Terms</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerHighlight}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  backgroundGlow: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
    opacity: 0.16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...THEME.shadows.glowBrand,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  glassCard: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    borderRadius: THEME.radius.sm,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 13,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceInput,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  inputWrapperFocused: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  signupBtn: {
    height: 50,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  signupGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: THEME.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  footerHighlight: {
    color: THEME.colors.secondary,
    fontWeight: '800',
  },
});
