import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { api } from '../lib/api';

export default function GreenCorridorScreen() {
  const { t } = useTranslation();
  const [route, setRoute] = useState<{ lat: number; lng: number }[]>([]);
  const [status, setStatus] = useState<Record<string, unknown>>({});

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      const from = `${loc.coords.latitude},${loc.coords.longitude}`;
      const to = '13.0634,80.2406';
      const res = await api.getEmergencyRoute(from, to);
      setRoute((res as { route: typeof route }).route || []);
      setStatus((res as { coordinationStatus: typeof status }).coordinationStatus || {});
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('green_corridor')}</Text>
      <Text style={styles.disclaimer}>Display only — does NOT control real traffic signals</Text>
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{String(status.message || 'Calculating route...')}</Text>
        <Text>ETA: {(status as { estimatedClearanceMinutes?: number }).estimatedClearanceMinutes || '—'} min clearance</Text>
      </View>
      <MapView style={styles.map} initialRegion={{ latitude: 13.07, longitude: 80.26, latitudeDelta: 0.1, longitudeDelta: 0.1 }}>
        {route.length > 1 && (
          <Polyline coordinates={route.map((p) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor="#059669" strokeWidth={4} />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  title: { fontSize: 22, fontWeight: '800', padding: 16, paddingBottom: 4 },
  disclaimer: { color: '#D97706', fontSize: 12, paddingHorizontal: 16, marginBottom: 8 },
  statusBox: { backgroundColor: '#ECFDF5', marginHorizontal: 16, padding: 12, borderRadius: 10, marginBottom: 8 },
  statusText: { fontWeight: '600', color: '#059669' },
  map: { flex: 1 },
});
