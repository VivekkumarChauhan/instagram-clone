import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNetworkStore, selectNetworkStatus } from '@store/networkStore';

export const NetworkBanner: React.FC = () => {
  const status = useNetworkStore(selectNetworkStatus);

  if (status !== 'offline') return null;

  return (
    <View style={styles.bannerContainer} pointerEvents="none">
      <View style={styles.bannerPill}>
        <Icon name="cloud-offline" size={14} color="#FF9F0A" />
        <Text style={styles.text}>You're offline — showing cached reels</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 12,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
  },
  bannerPill: {
    backgroundColor: 'rgba(20, 20, 20, 0.92)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 159, 10, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  text: {
    color: '#FF9F0A',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
