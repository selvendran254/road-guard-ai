import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function WeatherScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [w, setW] = useState<Record<string, string | number>>({});

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      const res = await api.getWeather(loc.coords.latitude, loc.coords.longitude);
      setW(res as Record<string, string | number>);
    })();
  }, []);

  const rows = [
    ['Condition', w.condition],
    ['Temperature', `${w.tempC}°C`],
    ['Wind', `${w.windKph} km/h`],
    ['Humidity', `${w.humidity}%`],
    ['Visibility', w.visibility],
    ['Road', w.roadCondition],
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>{t('weather_alerts')}</Text>
      <View style={[styles.alertBox, { backgroundColor: theme.card }]}>
        <Text style={styles.alert}>{String(w.driveAlert || '')}</Text>
      </View>
      {rows.map(([k, v]) => (
        <View key={k} style={[styles.row, { backgroundColor: theme.card }]}>
          <Text style={{ color: theme.textMuted }}>{k}</Text>
          <Text style={[styles.val, { color: theme.text }]}>{String(v)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  alertBox: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F59E0B' },
  alert: { color: '#92400E', fontWeight: '600', lineHeight: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  val: { fontWeight: '700', textTransform: 'capitalize' },
});
