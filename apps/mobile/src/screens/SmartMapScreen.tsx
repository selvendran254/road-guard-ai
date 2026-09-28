import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { api } from '../lib/api';

export default function SmartMapScreen() {
  const { t } = useTranslation();
  const [region, setRegion] = useState({ latitude: 13.0827, longitude: 80.2707, latitudeDelta: 0.08, longitudeDelta: 0.08 });
  const [markers, setMarkers] = useState<{ id: string; lat: number; lng: number; title: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 });
        const [hazards, hospitals, ambulances, bloodBanks] = await Promise.all([
          api.getNearbyHazards(loc.coords.latitude, loc.coords.longitude),
          api.getNearbyHospitals(loc.coords.latitude, loc.coords.longitude),
          api.getNearbyAmbulances(loc.coords.latitude, loc.coords.longitude),
          api.getNearbyBloodBanks(loc.coords.latitude, loc.coords.longitude),
        ]);
        const all = [
          ...((hazards as { hazards: { id: string; lat: number; lng: number; type: string }[] }).hazards || []).map((h) => ({ id: h.id, lat: h.lat, lng: h.lng, title: `⚠️ ${h.type}` })),
          ...((hospitals as { hospitals: { id: string; lat: number; lng: number; name: string }[] }).hospitals || []).map((h) => ({ id: h.id, lat: h.lat, lng: h.lng, title: `🏥 ${h.name}` })),
          ...((ambulances as { ambulances: { id: string; lat: number; lng: number; name: string }[] }).ambulances || []).map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, title: `🚑 ${a.name}` })),
          ...((bloodBanks as { bloodBanks: { id: string; lat: number; lng: number; name: string }[] }).bloodBanks || []).map((b) => ({ id: b.id, lat: b.lat, lng: b.lng, title: `🩸 ${b.name}` })),
        ];
        setMarkers(all);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('smart_map')}</Text>
      <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion}>
        {markers.map((m) => (
          <Marker key={m.id} coordinate={{ latitude: m.lat, longitude: m.lng }} title={m.title} />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  title: { fontSize: 20, fontWeight: '800', padding: 16, paddingBottom: 8 },
  map: { width: Dimensions.get('window').width, flex: 1 },
});
