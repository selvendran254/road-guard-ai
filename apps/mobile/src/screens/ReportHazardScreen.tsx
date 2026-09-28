import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const TYPES = ['pothole', 'obstacle', 'accident', 'construction', 'flooding', 'other'];

export default function ReportHazardScreen({ navigation }: { navigation: { navigate: (s: string) => void } }) {
  const { t } = useTranslation();
  const { refreshSession } = useAuth();
  const [type, setType] = useState('pothole');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const pickPhoto = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed'); return; }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.5, base64: true });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 || null);
    }
  };

  const submit = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    await api.reportHazard({ type, description, lat: loc.coords.latitude, lng: loc.coords.longitude, photoBase64: photoBase64?.slice(0, 2000) });
    await refreshSession();
    Alert.alert('Submitted', 'Hazard report sent');
    navigation.navigate('MyReports');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('report_hazard')}</Text>
      <Text style={styles.label}>{t('hazard_type')}</Text>
      <View style={styles.types}>
        {TYPES.map((tp) => (
          <TouchableOpacity key={tp} style={[styles.typeBtn, type === tp && styles.typeActive]} onPress={() => setType(tp)}>
            <Text style={type === tp ? styles.typeActiveText : styles.typeText}>{tp}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>{t('description')}</Text>
      <TextInput style={[styles.input, { height: 100 }]} value={description} onChangeText={setDescription} multiline />
      <Text style={styles.label}>📷 Photo (optional)</Text>
      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(true)}><Text style={styles.photoBtnText}>Camera</Text></TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(false)}><Text style={styles.photoBtnText}>Gallery</Text></TouchableOpacity>
      </View>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
      <TouchableOpacity style={styles.btn} onPress={submit}><Text style={styles.btnText}>{t('submit')}</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 8, color: '#64748B' },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  typeActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  typeText: { color: '#334155', fontSize: 13 },
  typeActiveText: { color: '#FFF', fontSize: 13 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, textAlignVertical: 'top' },
  photoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  photoBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 10, alignItems: 'center' },
  photoBtnText: { fontWeight: '600', color: '#334155' },
  preview: { width: '100%', height: 180, borderRadius: 10, marginBottom: 12 },
  btn: { backgroundColor: '#DC2626', padding: 14, borderRadius: 10, marginTop: 16 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
});
