import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { api } from '../lib/api';

export default function BloodBankScreen() {
  const { t } = useTranslation();
  const [banks, setBanks] = useState<{ id: string; name: string; phone: string; groups: string[]; distanceKm: number }[]>([]);
  const [group, setGroup] = useState('O+');
  const [units, setUnits] = useState('1');

  const load = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    const res = await api.getNearbyBloodBanks(loc.coords.latitude, loc.coords.longitude, group);
    setBanks((res as { bloodBanks: typeof banks }).bloodBanks || []);
  };

  useEffect(() => { load(); }, [group]);

  const requestBlood = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    await api.requestBlood({ bloodGroup: group, units: parseInt(units), lat: loc.coords.latitude, lng: loc.coords.longitude });
    Alert.alert('Submitted', t('blood_request'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('blood_bank')}</Text>
      <View style={styles.requestBox}>
        <Text style={styles.section}>{t('blood_request')}</Text>
        <TextInput style={styles.input} value={group} onChangeText={setGroup} placeholder={t('blood_group')} />
        <TextInput style={styles.input} value={units} onChangeText={setUnits} keyboardType="numeric" placeholder="Units" />
        <TouchableOpacity style={styles.btn} onPress={requestBlood}><Text style={styles.btnText}>{t('submit')}</Text></TouchableOpacity>
      </View>
      <FlatList
        data={banks}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>{item.phone} | {item.distanceKm.toFixed(1)} km</Text>
            <Text style={styles.groups}>{item.groups.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  requestBox: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  section: { fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, marginBottom: 8 },
  btn: { backgroundColor: '#DC2626', padding: 12, borderRadius: 8 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  name: { fontWeight: '700' },
  sub: { color: '#64748B', marginTop: 4 },
  groups: { color: '#DC2626', marginTop: 4, fontSize: 13 },
});
