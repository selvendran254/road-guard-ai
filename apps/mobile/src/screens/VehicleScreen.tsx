import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function VehicleScreen() {
  const { t } = useTranslation();
  const { session, refreshSession } = useAuth();
  const vehicles = (session?.vehicles || []) as { id: string; number: string; type: string; model: string; isActive: boolean }[];
  const [number, setNumber] = useState('');
  const [type, setType] = useState('car');
  const [model, setModel] = useState('');

  const addVehicle = async () => {
    await api.updateVehicle({ number, type, model, setActive: true });
    await refreshSession();
    setNumber('');
    setModel('');
    Alert.alert('Saved');
  };

  const setActive = async (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    if (v) {
      await api.updateVehicle({ id, number: v.number, type: v.type, model: v.model, setActive: true });
      await refreshSession();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('vehicle_details')}</Text>
      {vehicles.map((v) => (
        <TouchableOpacity key={v.id} style={[styles.card, v.isActive && styles.active]} onPress={() => setActive(v.id)}>
          <Text style={styles.cardTitle}>{v.number} {v.isActive ? '✓' : ''}</Text>
          <Text style={styles.cardSub}>{v.type} — {v.model}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.section}>{t('add_vehicle')}</Text>
      <TextInput style={styles.input} placeholder={t('vehicle_number')} value={number} onChangeText={setNumber} />
      <TextInput style={styles.input} placeholder={t('vehicle_type')} value={type} onChangeText={setType} />
      <TextInput style={styles.input} placeholder={t('vehicle_model')} value={model} onChangeText={setModel} />
      <TouchableOpacity style={styles.btn} onPress={addVehicle}><Text style={styles.btnText}>{t('add_vehicle')}</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  active: { borderColor: '#DC2626', borderWidth: 2 },
  cardTitle: { fontWeight: '700' },
  cardSub: { color: '#64748B', marginTop: 4 },
  section: { fontWeight: '700', marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 8 },
  btn: { backgroundColor: '#DC2626', padding: 14, borderRadius: 10, marginTop: 8 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
});
