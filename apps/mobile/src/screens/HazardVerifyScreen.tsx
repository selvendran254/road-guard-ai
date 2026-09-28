import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function HazardVerifyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [hazards, setHazards] = useState<{ id: string; type: string; description: string; confirmations: string[]; status: string; distanceKm?: number }[]>([]);

  const load = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    const res = await api.getNearbyHazards(loc.coords.latitude, loc.coords.longitude);
    setHazards((res as { hazards: typeof hazards }).hazards || []);
  };

  useEffect(() => { load(); }, []);

  const confirm = async (id: string) => {
    try {
      await api.confirmHazard(id);
      Alert.alert(t('confirmed'), t('hazard_confirmed_msg'));
      load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('verify_hazards')}</Text>
      <Text style={styles.sub}>{t('verify_hazards_hint')}</Text>
      <FlatList
        data={hazards}
        keyExtractor={(h) => h.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.type, { color: theme.text }]}>{item.type} — {item.status}</Text>
            <Text style={styles.desc}>{item.description || 'No description'}</Text>
            <Text style={styles.conf}>{item.confirmations?.length || 0}/3 {t('confirmations')}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => confirm(item.id)}>
              <Text style={styles.btnText}>✓ {t('confirm_hazard')}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('no_nearby_hazards')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  sub: { color: '#64748B', marginBottom: 16, marginTop: 4, fontSize: 13 },
  card: { padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  type: { fontWeight: '700', textTransform: 'capitalize' },
  desc: { color: '#64748B', marginTop: 4 },
  conf: { color: '#059669', marginTop: 6, fontSize: 12 },
  btn: { marginTop: 8, backgroundColor: '#059669', padding: 10, borderRadius: 8 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
  empty: { color: '#94A3B8', textAlign: 'center', marginTop: 32 },
});
