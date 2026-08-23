import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '@store/authStore';
import { THEME } from '@utils/theme';
import type { AuthScreenProps } from '@appTypes/navigation';

type Props = AuthScreenProps<'OTPVerification'>;

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const email = route.params?.email || 'user@example.com';
  const purpose = route.params?.purpose || 'email_verification';
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRef = useRef<TextInput>(null);

  const verifyOTP = useAuthStore(s => s.verifyOTP);
  const forgotPassword = useAuthStore(s => s.forgotPassword);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  // Focus input on mount
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(focusTimer);
  }, []);

  // Handle AppState changes (prevent screen freeze when pulling down notification shade / backgrounding)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Re-focus and reset any stuck keyboard transitions
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  // Safe countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const code = codeToVerify || otp;
      if (code.length < 6 || isLoading) return;
      try {
        await verifyOTP({ email, otp: code, purpose });
      } catch (_) {}
    },
    [email, otp, purpose, isLoading, verifyOTP],
  );

  const handleOtpChange = (text: string) => {
    if (error) clearError();
    const clean = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(clean);

    if (clean.length === 6) {
      handleVerify(clean);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isLoading) return;
    try {
      await forgotPassword({ email });
      setResendTimer(60);
    } catch (_) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

      <LinearGradient
        colors={[...THEME.colors.gradients.brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGlow}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <LinearGradient
            colors={[...THEME.colors.gradients.aurora]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <FontAwesome5 name="shield-alt" size={28} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.title}>Security Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        </View>

        <View style={styles.glassCard}>
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#FF4D4D" style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Digits Container with absolute transparent input on top */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.digitsWrapper}
          >
            <View style={styles.digitsRow} pointerEvents="none">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = otp[index] || '';
                const isFocused = otp.length === index || (index === 5 && otp.length === 6);
                const isFilled = Boolean(char);

                return (
                  <View
                    key={index}
                    style={[
                      styles.digitBox,
                      isFilled && styles.digitBoxFilled,
                      isFocused && styles.digitBoxActive,
                    ]}
                  >
                    <Text style={styles.digitText}>{char}</Text>
                  </View>
                );
              })}
            </View>

            {/* Transparent input covering entire digit row for 100% reliable tap response */}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleOtpChange}
              maxLength={6}
              keyboardType="number-pad"
              returnKeyType="done"
              style={styles.overlayInput}
              autoFocus
              caretHidden
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleVerify()}
            disabled={otp.length < 6 || isLoading}
            style={[styles.verifyBtn, (otp.length < 6 || isLoading) && styles.btnDisabled]}
          >
            <LinearGradient
              colors={[...THEME.colors.gradients.brand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.verifyBtnText}>Confirm & Continue</Text>
                  <FontAwesome5 name="check" size={14} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0 || isLoading}>
              <Text
                style={[
                  styles.resendAction,
                  (resendTimer > 0 || isLoading) && styles.resendActionDisabled,
                ]}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  backgroundGlow: {
    position: 'absolute',
    top: -120,
    left: '50%',
    marginLeft: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.16,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  glassCard: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: THEME.radius.sm,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 13,
    flex: 1,
  },
  digitsWrapper: {
    position: 'relative',
    height: 56,
    marginBottom: 28,
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  digitBox: {
    width: 46,
    height: 56,
    borderRadius: THEME.radius.sm,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBoxFilled: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  digitBoxActive: {
    borderColor: THEME.colors.accent,
  },
  digitText: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
    color: 'transparent',
    backgroundColor: 'transparent',
    zIndex: 10,
    elevation: 10,
  },
  verifyBtn: {
    height: 50,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    marginBottom: 18,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  verifyGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  resendAction: {
    color: THEME.colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  resendActionDisabled: {
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
});
