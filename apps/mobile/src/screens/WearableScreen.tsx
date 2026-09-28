import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function WearableScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [connected, setConnected] = useState(false);
  const [device, setDevice] = useState<{ deviceName?: string; lastHeartRate?: number; fallDetected?: boolean } | null>(null);

  const load = () => api.getWearableStatus().then((r) => {
    const d = r as { connected: boolean; device: typeof device };
    setConnected(d.connected);
    setDevice(d.device);
  });

  useEffect(() => { load(); }, []);

  const toggle = async (val: boolean) => {
    if (val) {
      await api.connectWearable('RoadGuard Watch');
    } else {
      await api.disconnectWearable();
    }
    load();
  };

  const simulateFall = async () => {
    await api.sendWearableSignal({ fallDetected: true, heartRate: 110 });
    load();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('wearable')}</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={{ color: theme.text }}>{t('connect_wearable')}</Text>
        <Switch value={connected} onValueChange={toggle} trackColor={{ true: '#DC2626' }} />
      </View>
      {connected && device && (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.device, { color: theme.text }]}>{device.deviceName}</Text>
          <Text style={styles.sub}>❤️ {device.lastHeartRate} bpm</Text>
          {device.fallDetected && <Text style={styles.warn}>{t('possible_fall')}</Text>}
          <TouchableOpacity style={styles.simBtn} onPress={simulateFall}>
            <Text style={styles.simText}>{t('simulate_fall')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  device: { fontWeight: '700', width: '100%' },
  sub: { color: '#64748B', marginTop: 8, width: '100%' },
  warn: { color: '#DC2626', fontWeight: '700', marginTop: 8, width: '100%' },
  simBtn: { marginTop: 12, backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8, width: '100%' },
  simText: { textAlign: 'center', color: '#92400E', fontWeight: '600' },
});
