import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function BlackSpotsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [spots, setSpots] = useState<{ id: string; name: string; lat: number; lng: number; accidentCount: number; severity: string; radiusM: number }[]>([]);

  useEffect(() => {
    api.getBlackSpots().then((r) => setSpots((r as { blackSpots: typeof spots }).blackSpots || []));
  }, []);

  const severityColor = (s: string) => (s === 'high' ? '#DC2626' : s === 'medium' ? '#D97706' : '#059669');

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('black_spots')}</Text>
      <MapView style={styles.map} initialRegion={{ latitude: 13.05, longitude: 80.24, latitudeDelta: 0.15, longitudeDelta: 0.15 }}>
        {spots.map((s) => (
          <View key={s.id}>
            <Circle center={{ latitude: s.lat, longitude: s.lng }} radius={s.radiusM} fillColor="rgba(220,38,38,0.2)" strokeColor="#DC2626" />
            <Marker coordinate={{ latitude: s.lat, longitude: s.lng }} title={s.name} description={`${s.accidentCount} accidents`} />
          </View>
        ))}
      </MapView>
      <FlatList
        data={spots}
        keyExtractor={(s) => s.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: severityColor(item.severity) }]}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <Text style={styles.sub}>{item.accidentCount} accidents | {item.severity} severity</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  map: { height: 220, borderRadius: 12, marginBottom: 12 },
  list: { flex: 1 },
  card: { padding: 12, borderRadius: 8, marginBottom: 6, borderLeftWidth: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  name: { fontWeight: '700' },
  sub: { color: '#64748B', fontSize: 12, marginTop: 2 },
});
