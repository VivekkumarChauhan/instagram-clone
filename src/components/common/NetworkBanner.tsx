import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStore, selectNetworkStatus } from '@store/networkStore';

export const NetworkBanner: React.FC = () => {
  const status = useNetworkStore(selectNetworkStatus);

  if (status !== 'offline') return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚡ You're offline — showing cached content</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
});
