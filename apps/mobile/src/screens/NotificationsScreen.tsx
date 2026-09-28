import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<{ id: string; title: string; body: string; read: boolean; createdAt: string }[]>([]);

  const load = () => {
    if (session) api.getNotifications(session.sessionId).then((r) => setNotifications((r as { notifications: typeof notifications }).notifications || []));
  };

  useEffect(() => { load(); }, [session]);

  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    load();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('notifications')}</Text>
      <FlatList
        data={notifications}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, !item.read && styles.unread]} onPress={() => markRead(item.id)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  unread: { borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  cardTitle: { fontWeight: '700' },
  body: { color: '#64748B', marginTop: 4 },
  date: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  empty: { color: '#94A3B8', textAlign: 'center', marginTop: 32 },
});
