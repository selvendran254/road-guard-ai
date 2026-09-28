import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'EmergencyActive'>;

export default function EmergencyActiveScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!session) return;
    const load = () => api.getEmergencyActive(session.sessionId).then(setData);
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const handleCancel = () => {
    Alert.alert(t('cancel_emergency'), t('confirm_cancel'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('confirm_cancel'),
        style: 'destructive',
        onPress: async () => {
          await api.cancelEmergency({ emergencyId: route.params.emergencyId, confirmed: true });
          navigation.goBack();
        },
      },
    ]);
  };

  const emergency = data?.emergency as Record<string, unknown> | undefined;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('emergency_active')}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>{t('dispatch_status')}</Text>
        <Text style={styles.value}>{String(data?.dispatchStatus || emergency?.status || 'dispatched')}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>{t('ambulance_eta')}</Text>
        <Text style={styles.value}>{String(data?.ambulanceEta || emergency?.ambulanceEta || '—')} min</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>{t('contacts_notified')}</Text>
        <Text style={styles.value}>{((data?.contactsNotified as string[]) || []).join(', ') || 'None'}</Text>
      </View>
      <TouchableOpacity
        style={styles.chatBtn}
        onPress={() => navigation.navigate('EmergencyChat', { emergencyId: route.params.emergencyId })}
      >
        <Text style={styles.chatText}>💬 {t('operator_chat')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
        <Text style={styles.cancelText}>{t('cancel_emergency')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FEF2F2' },
  title: { fontSize: 24, fontWeight: '800', color: '#DC2626', marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FECACA' },
  label: { color: '#64748B', fontSize: 13 },
  value: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 4 },
  chatBtn: { marginTop: 16, backgroundColor: '#1E293B', borderRadius: 12, padding: 16 },
  chatText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
  cancelBtn: { marginTop: 12, borderWidth: 2, borderColor: '#DC2626', borderRadius: 12, padding: 16 },
  cancelText: { color: '#DC2626', textAlign: 'center', fontWeight: '700' },
});
