import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';
import NetInfo from '@react-native-community/netinfo';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { queueSos } from '../lib/offlineQueue';
import { pushLocal } from '../lib/notifications';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'SosCountdown'>;

export default function SosCountdownScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const duration = (session?.settings as { sosCountdownSeconds?: number })?.sosCountdownSeconds || 5;
  const [seconds, setSeconds] = useState(duration);
  const [phase, setPhase] = useState<'countdown' | 'confirm'>('countdown');

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (seconds <= 0) {
      setPhase('confirm');
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, phase]);

  const dispatchSos = async () => {
    const loc = session?.location || { lat: 13.0827, lng: 80.2707 };
    const payload = { lat: loc.lat, lng: loc.lng, confirmed: true };

    Speech.speak(t('voice_sos_alert'), { language: i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US' });

    const net = await NetInfo.fetch();
    try {
      if (!net.isConnected) {
        await queueSos(payload);
        Alert.alert('Offline', t('offline_banner'));
      } else {
        const res = await api.triggerSos(payload);
        await pushLocal(t('emergency_active'), t('voice_sos_alert'));
        navigation.replace('EmergencyActive', { emergencyId: (res as { emergency: { id: string } }).emergency.id });
        return;
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'SOS failed');
      return;
    }
    navigation.goBack();
  };

  if (phase === 'confirm') {
    return (
      <View style={styles.container}>
        <Text style={styles.confirmTitle}>{t('are_you_safe')}</Text>
        <TouchableOpacity style={styles.safeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.safeText}>{t('im_safe')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sosBtn} onPress={dispatchSos}>
          <Text style={styles.sosText}>{t('send_sos')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.countdown}>{seconds}</Text>
      <Text style={styles.label}>{t('sos_countdown', { seconds })}</Text>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>{t('cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DC2626', padding: 24 },
  countdown: { fontSize: 96, fontWeight: '900', color: '#FFF' },
  label: { color: '#FEE2E2', fontSize: 18, marginTop: 8 },
  cancelBtn: { marginTop: 48, backgroundColor: '#FFF', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  cancelText: { color: '#DC2626', fontWeight: '700', fontSize: 16 },
  confirmTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 32, textAlign: 'center' },
  safeBtn: { backgroundColor: '#059669', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 12, marginBottom: 16, width: '100%' },
  safeText: { color: '#FFF', textAlign: 'center', fontWeight: '700', fontSize: 18 },
  sosBtn: { backgroundColor: '#FFF', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 12, width: '100%' },
  sosText: { color: '#DC2626', textAlign: 'center', fontWeight: '900', fontSize: 18 },
});
