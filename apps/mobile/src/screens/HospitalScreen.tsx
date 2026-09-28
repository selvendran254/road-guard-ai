import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { api } from '../lib/api';

export default function HospitalScreen() {
  const { t } = useTranslation();
  const [hospitals, setHospitals] = useState<{ id: string; name: string; phone: string; distanceKm: number; bedsAvailable: number }[]>([]);

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      const res = await api.getNearbyHospitals(loc.coords.latitude, loc.coords.longitude);
      setHospitals((res as { hospitals: typeof hospitals }).hospitals || []);
    })();
  }, []);

  const preAlert = async (hospitalId: string) => {
    try {
      await api.sendPreAlert(hospitalId);
      Alert.alert('Sent', t('hospital_pre_alert'));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Consent required');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('nearby_hospitals')}</Text>
      <FlatList
        data={hospitals}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>{item.phone} | {item.distanceKm.toFixed(1)} km | Beds: {item.bedsAvailable}</Text>
            <TouchableOpacity onPress={() => preAlert(item.id)}><Text style={styles.link}>{t('hospital_pre_alert')}</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  name: { fontWeight: '700' },
  sub: { color: '#64748B', marginTop: 4 },
  link: { color: '#DC2626', marginTop: 8, fontWeight: '600' },
});
