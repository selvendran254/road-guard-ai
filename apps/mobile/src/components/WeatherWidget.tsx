import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function WeatherWidget({ lat, lng, onPress }: { lat?: number; lng?: number; onPress?: () => void }) {
  const theme = useTheme();
  const [weather, setWeather] = useState<{ condition: string; tempC: number; driveAlert: string; roadCondition: string } | null>(null);

  useEffect(() => {
    api.getWeather(lat || 13.0827, lng || 80.2707).then(setWeather).catch(() => null);
  }, [lat, lng]);

  if (!weather) return null;

  const icons: Record<string, string> = { clear: '☀️', cloudy: '☁️', rain: '🌧️', fog: '🌫️', storm: '⛈️' };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={onPress} disabled={!onPress}>
      <Text style={[styles.title, { color: theme.text, fontSize: theme.fontSize }]}>
        {icons[weather.condition] || '🌤️'} {weather.tempC}°C — {weather.condition}
      </Text>
      <Text style={[styles.alert, weather.roadCondition !== 'good' && styles.warn]}>{weather.driveAlert}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontWeight: '700' },
  alert: { color: '#64748B', marginTop: 6, fontSize: 13 },
  warn: { color: '#D97706', fontWeight: '600' },
});
