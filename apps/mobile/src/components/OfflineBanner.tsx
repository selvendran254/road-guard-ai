import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import { flushQueue } from '../lib/offlineQueue';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const isOffline = !state.isConnected;
      setOffline(!!isOffline);
      if (state.isConnected) flushQueue();
    });
    return () => unsub();
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{t('offline_banner')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#D97706', padding: 8, alignItems: 'center' },
  text: { color: '#FFF', fontWeight: '600', fontSize: 13 },
});
