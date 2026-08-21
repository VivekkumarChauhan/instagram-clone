import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, COMPANY_NAME } from '@utils/constants';
import type { AuthScreenProps } from '@appTypes/navigation';

type Props = AuthScreenProps<'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.centerContainer}>
        <LinearGradient
          colors={['#FEE440', '#FF5400', '#E1006A', '#7209B7']}
          start={{ x: 0.1, y: 0.9 }}
          end={{ x: 0.9, y: 0.1 }}
          style={styles.iconSquircle}
        >
          <View style={styles.innerCutout}>
            <Icon name="camera-outline" size={46} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.fromText}>from</Text>
        <View style={styles.companyRow}>
          <LinearGradient
            colors={['#FF5400', '#E1006A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.companyBadge}
          >
            <Icon name="infinite" size={18} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.companyText}>{COMPANY_NAME}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSquircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E1006A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  innerCutout: {
    width: 84,
    height: 84,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  bottomContainer: {
    alignItems: 'center',
    gap: 6,
  },
  fromText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1.2,
  },
});
