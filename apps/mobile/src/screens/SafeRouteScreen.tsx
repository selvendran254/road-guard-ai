import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function SafeRouteScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [route, setRoute] = useState<{ lat: number; lng: number }[]>([]);
  const [info, setInfo] = useState<{ distanceKm?: number; safetyScore?: number; hazardsAvoided?: number }>({});

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      const from = `${loc.coords.latitude},${loc.coords.longitude}`;
      const to = '13.0634,80.2406';
      const res = await api.getSafeRoute(from, to);
      setRoute((res as { route: typeof route }).route || []);
      setInfo(res as typeof info);
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text, fontSize: theme.titleSize }]}>{t('safe_route')}</Text>
      <Text style={styles.info}>
        {info.distanceKm?.toFixed(1)} km | Safety: {info.safetyScore}/100 | Hazards avoided: {info.hazardsAvoided}
      </Text>
      <MapView style={styles.map} initialRegion={{ latitude: 13.07, longitude: 80.26, latitudeDelta: 0.12, longitudeDelta: 0.12 }}>
        {route.length > 1 && (
          <Polyline coordinates={route.map((p) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor="#059669" strokeWidth={5} />
        )}
        {route.map((p, i) => (
          <Marker key={i} coordinate={{ latitude: p.lat, longitude: p.lng }} title={i === 0 ? 'Start' : i === route.length - 1 ? 'Destination' : `Waypoint ${i}`} />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: '800', marginBottom: 4 },
  info: { color: '#64748B', marginBottom: 8, fontSize: 13 },
  map: { flex: 1, width: Dimensions.get('window').width - 32, borderRadius: 12 },
});
