import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function TripHistoryScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { session, refreshSession } = useAuth();
  const [trips, setTrips] = useState<{ id: string; startTime: string; distanceKm: number; safetyScore: number; harshBraking: number }[]>([]);
  const [score, setScore] = useState(85);
  const [badges, setBadges] = useState<string[]>([]);
  const [active, setActive] = useState(false);

  const load = () => {
    if (!session) return;
    api.getTripHistory(session.sessionId).then((r) => {
      const d = r as { trips: typeof trips; safetyScore: number; badges: string[] };
      setTrips(d.trips || []);
      setScore(d.safetyScore);
      setBadges(d.badges || []);
    });
    api.getActiveTrip().then((r) => setActive(!!(r as { trip: unknown }).trip));
  };

  useEffect(() => { load(); }, [session]);

  const startTrip = async () => {
    await api.startTrip();
    setActive(true);
    Alert.alert(t('trip_started'));
  };

  const endTrip = async () => {
    await api.endTrip();
    setActive(false);
    await refreshSession();
    load();
    Alert.alert(t('trip_ended'));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('trip_history')}</Text>
      <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
        <Text style={styles.scoreLabel}>{t('safety_score')}</Text>
        <Text style={[styles.score, { color: score >= 80 ? '#059669' : '#D97706' }]}>{score}/100</Text>
        <Text style={styles.badges}>{badges.map((b) => `🏅 ${b}`).join('  ') || t('no_badges')}</Text>
      </View>
      <TouchableOpacity style={[styles.btn, active && styles.endBtn]} onPress={active ? endTrip : startTrip}>
        <Text style={styles.btnText}>{active ? t('end_trip') : t('start_trip')}</Text>
      </TouchableOpacity>
      <FlatList
        data={trips}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{new Date(item.startTime).toLocaleString()}</Text>
            <Text style={styles.sub}>{item.distanceKm.toFixed(1)} km | Score: {item.safetyScore} | Braking: {item.harshBraking}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('no_trips')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  scoreCard: { padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  scoreLabel: { color: '#64748B' },
  score: { fontSize: 36, fontWeight: '900', marginVertical: 4 },
  badges: { color: '#059669', fontSize: 12 },
  btn: { backgroundColor: '#059669', padding: 14, borderRadius: 10, marginBottom: 16 },
  endBtn: { backgroundColor: '#DC2626' },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
  card: { padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontWeight: '700' },
  sub: { color: '#64748B', marginTop: 4, fontSize: 13 },
  empty: { color: '#94A3B8', textAlign: 'center', marginTop: 24 },
});
