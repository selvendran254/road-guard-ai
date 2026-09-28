import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { api } from '../lib/api';

export default function AmbulanceScreen({ navigation }: { navigation: { navigate: (s: string, p?: object) => void } }) {
  const { t } = useTranslation();
  const [ambulances, setAmbulances] = useState<{ id: string; name: string; distanceKm: number; etaMinutes: number; status: string }[]>([]);
  const [request, setRequest] = useState<{ id: string; status: string; eta: number } | null>(null);

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      const res = await api.getNearbyAmbulances(loc.coords.latitude, loc.coords.longitude);
      setAmbulances((res as { ambulances: typeof ambulances }).ambulances || []);
    })();
  }, []);

  const requestAmbulance = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    const res = await api.requestAmbulance({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    setRequest((res as { request: typeof request }).request);
    Alert.alert('Dispatched', `ETA: ${(res as { request: { eta: number } }).request.eta} min`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('ambulance_tracking')}</Text>
      <TouchableOpacity style={styles.btn} onPress={requestAmbulance}><Text style={styles.btnText}>{t('request_ambulance')}</Text></TouchableOpacity>
      {request && (
        <View style={styles.status}>
          <Text>Status: {request.status} | ETA: {request.eta} min</Text>
          <TouchableOpacity onPress={() => navigation.navigate('GreenCorridor')}>
            <Text style={styles.link}>→ {t('green_corridor')}</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={ambulances}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>{item.distanceKm.toFixed(1)} km | ETA {item.etaMinutes} min | {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  btn: { backgroundColor: '#DC2626', padding: 14, borderRadius: 10, marginBottom: 16 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
  status: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  link: { color: '#DC2626', marginTop: 8, fontWeight: '600' },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  name: { fontWeight: '700' },
  sub: { color: '#64748B', marginTop: 4 },
});
