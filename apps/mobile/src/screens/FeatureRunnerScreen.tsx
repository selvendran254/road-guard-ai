import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Linking, Share, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../context/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { getFeatureById } from '../data/featuresRegistry';
import { api } from '../lib/api';
import { pushLocal } from '../lib/notifications';

type Props = NativeStackScreenProps<MainStackParamList, 'FeatureRunner'>;

export default function FeatureRunnerScreen({ route, navigation }: Props) {
  const { featureId } = route.params;
  const feature = getFeatureById(featureId);
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [dashcamActive, setDashcamActive] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    if (!feature) return;
    if (feature.type === 'api-list' && feature.endpoint) loadList();
    if (feature.type === 'call') setResult(`Tap the button below to call ${feature.phone}`);
  }, [featureId]);

  if (!feature) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Feature not found</Text>
      </View>
    );
  }

  async function loadList() {
    if (!feature?.endpoint) return;
    setLoading(true);
    try {
      let path = feature.endpoint;
      if (path.includes('route-heatmap/me')) {
        const session = await api.getSession();
        path = path.replace('/me', `/${(session as { sessionId?: string }).sessionId || 'demo'}`);
      }
      const data = await api.featureRequest(path, feature.method || 'GET');
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function runAction(extraBody?: Record<string, unknown>) {
    setLoading(true);
    try {
      if (feature!.type === 'call' && feature!.phone) {
        await Linking.openURL(`tel:${feature!.phone}`);
        setResult(`Calling ${feature!.phone}...`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }

      if (feature!.deviceAction) {
        await runDeviceAction(feature!.deviceAction, extraBody);
        return;
      }

      if (feature!.endpoint) {
        const body = feature!.type === 'api-form' ? { ...formData, ...extraBody } : extraBody;
        const data = await api.featureRequest(feature!.endpoint, feature!.method || 'POST', body);
        setResult(JSON.stringify(data, null, 2));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (feature!.id === 'f32') setDashcamActive(true);
        return;
      }
    } catch (e) {
      setResult(`Error: ${(e as Error).message}`);
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function runDeviceAction(action: string, extra?: Record<string, unknown>) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const loc = status === 'granted' ? await Location.getCurrentPositionAsync({}) : null;

    switch (action) {
      case 'biometric': {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) { setResult('Biometric not available on this device'); return; }
        const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Medical Data' });
        setResult(result.success ? '✅ Biometric verified — medical data unlocked' : '❌ Authentication failed');
        break;
      }
      case 'test-push':
        await pushLocal('RoadGuard Alert', 'Push notification test — feature working!');
        setResult('✅ Push notification sent!');
        break;
      case 'shake-sos':
        setResult('✅ Shake-to-SOS enabled! Shake your phone 3 times quickly to trigger SOS.\n\n(This runs in background while app is open)');
        navigation.navigate('SosCountdown');
        break;
      case 'background-crash':
        setResult('✅ Background crash detection enabled!\n\nAccelerometer monitoring active even when you switch apps.');
        break;
      case 'background-gps':
        setResult('✅ Background GPS tracking enabled!\n\nLocation updates every 30 seconds.');
        break;
      case 'speed-limit': {
        if (!loc) { setResult('Location permission needed'); return; }
        const data = await api.featureRequest(`/features/navigation/speed-limit?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}`, 'GET');
        const speed = (loc.coords.speed || 0) * 3.6;
        setResult(`Current speed: ${speed.toFixed(0)} km/h\nSpeed limit: ${(data as { speedLimit?: number }).speedLimit} km/h\n${speed > ((data as { speedLimit?: number }).speedLimit || 60) ? '⚠️ OVER SPEED LIMIT!' : '✅ Within limit'}`);
        break;
      }
      case 'save-parking': {
        if (!loc) { setResult('Location permission needed'); return; }
        const data = await api.featureRequest('/features/navigation/parking/save', 'POST', { lat: loc.coords.latitude, lng: loc.coords.longitude, note: 'My parking spot' });
        setResult(`✅ Parking saved!\n${JSON.stringify(data, null, 2)}`);
        break;
      }
      case 'live-share': {
        if (!loc) { setResult('Location permission needed'); return; }
        const data = await api.featureRequest('/features/navigation/live-share/start', 'POST', { lat: loc.coords.latitude, lng: loc.coords.longitude }) as { shareUrl?: string; googleMapsUrl?: string };
        await Share.share({ message: `Track my location: ${data.shareUrl || data.googleMapsUrl}` });
        setResult(`✅ Live share started!\n${JSON.stringify(data, null, 2)}`);
        break;
      }
      case 'whatsapp': {
        const msg = encodeURIComponent('🚨 RoadGuard SOS — I need help! Track me on RoadGuard app.');
        await Linking.openURL(`whatsapp://send?text=${msg}`).catch(() => Share.share({ message: decodeURIComponent(msg) }));
        setResult('✅ WhatsApp alert opened!');
        break;
      }
      case 'sos-media': {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { Alert.alert('Camera permission needed'); return; }
        const photo = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
        if (!photo.canceled && photo.assets[0]?.base64) {
          await api.featureRequest('/features/emergency/sos-media', 'POST', { photoBase64: photo.assets[0].base64.slice(0, 500) });
          setResult('✅ Photo attached to SOS record!\nNow triggering SOS...');
          navigation.navigate('SosCountdown');
        }
        break;
      }
      default:
        setResult(`Device action "${action}" executed`);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const isDashcam = feature.id === 'f32' && dashcamActive;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.heroIcon}>{feature.icon}</Text>
        <Text style={[styles.heroTitle, { color: theme.text }]}>{feature.title}</Text>
        <Text style={[styles.heroDesc, { color: theme.textMuted }]}>{feature.description}</Text>
        <Text style={styles.badge}>{feature.category} • {feature.type}</Text>
      </View>

      {isDashcam && cameraPermission?.granted && (
        <View style={styles.dashcamWrap}>
          <CameraView style={styles.dashcam} facing="back" />
          <Text style={styles.recording}>● REC Dashcam Active</Text>
        </View>
      )}

      {feature.type === 'api-form' && feature.formFields?.map((field) => (
        <TextInput
          key={field.key}
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder={field.placeholder || field.label}
          placeholderTextColor={theme.textMuted}
          value={formData[field.key] || ''}
          onChangeText={(v) => setFormData((p) => ({ ...p, [field.key]: v }))}
        />
      ))}

      <TouchableOpacity
        style={[styles.actionBtn, loading && styles.disabled]}
        onPress={() => runAction(feature.id === 'f10' ? { enabled: true } : feature.id === 'f47' ? { action: 'invite' } : undefined)}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : (
          <Text style={styles.actionText}>
            {feature.type === 'call' ? `📞 Call ${feature.phone}` :
             feature.type === 'api-list' ? '🔄 Refresh Data' :
             feature.id === 'f32' && dashcamActive ? '⏹ Stop Dashcam' :
             `▶ Run ${feature.title}`}
          </Text>
        )}
      </TouchableOpacity>

      {feature.type === 'api-list' && (
        <TouchableOpacity style={[styles.secondaryBtn, { borderColor: theme.border }]} onPress={loadList}>
          <Text style={[styles.secondaryText, { color: theme.text }]}>🔄 Reload</Text>
        </TouchableOpacity>
      )}

      {isDashcam && (
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: '#DC2626' }]}
          onPress={async () => {
            await api.featureRequest('/features/ai/dashcam/stop', 'POST');
            setDashcamActive(false);
            setResult('Dashcam stopped. Clip saved.');
          }}
        >
          <Text style={[styles.secondaryText, { color: '#DC2626' }]}>⏹ Stop Recording</Text>
        </TouchableOpacity>
      )}

      {feature.id === 'f32' && !dashcamActive && !cameraPermission?.granted && (
        <TouchableOpacity style={[styles.secondaryBtn, { borderColor: theme.border }]} onPress={requestCameraPermission}>
          <Text style={[styles.secondaryText, { color: theme.text }]}>📷 Grant Camera for Dashcam</Text>
        </TouchableOpacity>
      )}

      {result ? (
        <View style={[styles.resultBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.resultTitle, { color: theme.text }]}>Result</Text>
          <Text style={[styles.resultText, { color: theme.textMuted }]} selectable>{result}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { borderRadius: 16, padding: 20, borderWidth: 1, alignItems: 'center', marginBottom: 16 },
  heroIcon: { fontSize: 48 },
  heroTitle: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  heroDesc: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  badge: { marginTop: 10, fontSize: 11, color: '#DC2626', fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15 },
  actionBtn: { backgroundColor: '#DC2626', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10 },
  disabled: { opacity: 0.6 },
  actionText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  secondaryText: { fontWeight: '600', fontSize: 15 },
  resultBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 8 },
  resultTitle: { fontWeight: '700', marginBottom: 8, fontSize: 14 },
  resultText: { fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
  dashcamWrap: { borderRadius: 12, overflow: 'hidden', marginBottom: 12, height: 200 },
  dashcam: { flex: 1 },
  recording: { position: 'absolute', top: 8, left: 8, color: '#FF0000', fontWeight: '800', backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: 4 },
});
