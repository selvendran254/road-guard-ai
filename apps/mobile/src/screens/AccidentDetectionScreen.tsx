import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../lib/api';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'AccidentDetection'>;

export default function AccidentDetectionScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });
  const [detected, setDetected] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(500);
    Gyroscope.setUpdateInterval(500);
    const aSub = Accelerometer.addListener(setAccel);
    const gSub = Gyroscope.addListener(setGyro);
    return () => { aSub.remove(); gSub.remove(); };
  }, []);

  useEffect(() => {
    const mag = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
    if (mag > 15 && !detected) {
      setDetected(true);
      setCountdown(5);
    }
  }, [accel, detected]);

  useEffect(() => {
    if (!detected || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [detected, countdown]);

  useEffect(() => {
    if (detected && countdown === 0) {
      confirmAccident();
    }
  }, [countdown, detected]);

  const confirmAccident = async () => {
    try {
      const res = await api.analyzeAccident({ accelerometer: accel, gyroscope: gyro, confirmed: true });
      const emg = (res as { emergency?: { id: string } }).emergency;
      if (emg) navigation.replace('EmergencyActive', { emergencyId: emg.id });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  const cancelDetection = () => {
    setDetected(false);
    setCountdown(0);
  };

  if (detected) {
    return (
      <View style={styles.alert}>
        <Text style={styles.alertTitle}>{t('possible_accident')}</Text>
        <Text style={styles.countdown}>{countdown || '!'}</Text>
        <TouchableOpacity style={styles.safeBtn} onPress={cancelDetection}>
          <Text style={styles.safeText}>{t('im_safe')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Automatic Accident Detection</Text>
      <Text style={styles.sub}>Monitoring sensors... Possible detection only — never guaranteed.</Text>
      <View style={styles.sensor}>
        <Text>Accel: {accel.x.toFixed(2)}, {accel.y.toFixed(2)}, {accel.z.toFixed(2)}</Text>
        <Text>Gyro: {gyro.x.toFixed(2)}, {gyro.y.toFixed(2)}, {gyro.z.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { color: '#64748B', marginTop: 8, marginBottom: 24 },
  sensor: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  alert: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DC2626', padding: 24 },
  alertTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  countdown: { fontSize: 72, fontWeight: '900', color: '#FFF', marginVertical: 24 },
  safeBtn: { backgroundColor: '#059669', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 12 },
  safeText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
});
