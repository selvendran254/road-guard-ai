import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

interface Overlay {
  label: string;
  value: string;
  warning?: boolean;
}

export default function RoadSafetyCameraScreen() {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.analyzeAll({ frame: 'mock', sensorData: { speed: 40 }, gps: { lat: 13.08, lng: 80.27 } }) as Record<string, Record<string, unknown>>;
        setOverlays([
          { label: 'Vehicle', value: `${((res.vehicle?.vehicles as unknown[]) || []).length} possible`, warning: false },
          { label: 'Collision Risk', value: String(res.collisionRisk?.level || 'low'), warning: res.collisionRisk?.possibleCollisionRisk as boolean },
          { label: 'Helmet', value: (res.helmet?.possibleHelmetMissing as boolean) ? 'Possible missing' : 'OK', warning: res.helmet?.possibleHelmetMissing as boolean },
          { label: 'Drowsiness', value: (res.drowsiness?.possibleDrowsiness as boolean) ? 'Possible' : 'OK', warning: res.drowsiness?.possibleDrowsiness as boolean },
          { label: 'Pothole', value: (res.pothole?.possiblePothole as boolean) ? 'Possible' : 'None', warning: res.pothole?.possiblePothole as boolean },
          { label: 'Obstacle', value: String(res.obstacle?.type || 'None'), warning: res.obstacle?.possibleObstacle as boolean },
        ]);
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('road_safety_camera')}</Text>
        <Text onPress={requestPermission} style={styles.link}>Grant camera permission</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        <View style={styles.overlayContainer}>
          {overlays.map((o) => (
            <View key={o.label} style={[styles.badge, o.warning && styles.badgeWarn]}>
              <Text style={styles.badgeLabel}>{o.label}</Text>
              <Text style={styles.badgeValue}>{o.value}</Text>
            </View>
          ))}
        </View>
      </CameraView>
      <Text style={styles.disclaimer}>All detections are "possible" — not guaranteed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: { fontSize: 20, fontWeight: '800', padding: 16 },
  link: { color: '#DC2626', padding: 16 },
  camera: { flex: 1 },
  overlayContainer: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#059669' },
  badgeWarn: { borderColor: '#DC2626' },
  badgeLabel: { color: '#94A3B8', fontSize: 10 },
  badgeValue: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  disclaimer: { color: '#94A3B8', textAlign: 'center', padding: 8, fontSize: 11 },
});
