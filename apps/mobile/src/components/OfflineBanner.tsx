import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import { flushQueue } from '../lib/offlineQueue';
import { isOfflineMode } from '../lib/api';

export default function OfflineBanner() {
  const [noInternet, setNoInternet] = useState(false);
  const { t } = useTranslation();
  const standalone = isOfflineMode();

  useEffect(() => {
    if (standalone) return;
    const unsub = NetInfo.addEventListener((state) => {
      setNoInternet(!state.isConnected);
      if (state.isConnected) flushQueue();
    });
    return () => unsub();
  }, [standalone]);

  if (standalone) {
    return (
      <View style={[styles.banner, styles.standalone]}>
        <Text style={styles.text}>📱 Standalone Mode — No laptop/server needed</Text>
      </View>
    );
  }

  if (!noInternet) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{t('offline_banner')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#D97706', padding: 8, alignItems: 'center' },
  standalone: { backgroundColor: '#059669' },
  text: { color: '#FFF', fontWeight: '600', fontSize: 13 },
});
