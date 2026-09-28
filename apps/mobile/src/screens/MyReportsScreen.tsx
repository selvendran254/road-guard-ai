import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function MyReportsScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [hazards, setHazards] = useState<{ id: string; type: string; status: string; description: string; createdAt: string }[]>([]);

  useEffect(() => {
    if (session) api.getMyHazards(session.sessionId).then((r) => setHazards((r as { hazards: typeof hazards }).hazards || []));
  }, [session]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('my_reports')}</Text>
      <Text style={styles.badge}>{t('reports_badge', { count: session?.reportsSubmitted || 0 })}</Text>
      <FlatList
        data={hazards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.type}>{item.type} — {item.status}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No reports yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  title: { fontSize: 24, fontWeight: '800' },
  badge: { color: '#059669', marginBottom: 16, marginTop: 4 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  type: { fontWeight: '700', textTransform: 'capitalize' },
  desc: { color: '#64748B', marginTop: 4 },
  date: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  empty: { color: '#94A3B8', textAlign: 'center', marginTop: 32 },
});
