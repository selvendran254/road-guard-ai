import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function MedicalProfileScreen() {
  const { t } = useTranslation();
  const { session, refreshSession } = useAuth();
  const med = (session?.medicalProfile || {}) as Record<string, string | boolean>;
  const [consent, setConsent] = useState(!!med.consentGiven);
  const [bloodGroup, setBloodGroup] = useState(String(med.bloodGroup || ''));
  const [allergies, setAllergies] = useState(String(med.allergies || ''));
  const [medications, setMedications] = useState(String(med.medications || ''));
  const [notes, setNotes] = useState(String(med.notes || ''));

  const save = async () => {
    if (!consent) return Alert.alert('Error', t('consent_required'));
    await api.updateMedical({ bloodGroup, allergies, medications, notes, consentGiven: consent });
    await refreshSession();
    Alert.alert('Saved');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('medical_profile')}</Text>
      <Text style={styles.optional}>Optional — requires explicit consent</Text>
      <View style={styles.consentRow}>
        <Text>I consent to store medical data (session only)</Text>
        <Switch value={consent} onValueChange={setConsent} trackColor={{ true: '#DC2626' }} />
      </View>
      <TextInput style={styles.input} placeholder={t('blood_group')} value={bloodGroup} onChangeText={setBloodGroup} editable={consent} />
      <TextInput style={styles.input} placeholder={t('allergies')} value={allergies} onChangeText={setAllergies} editable={consent} />
      <TextInput style={styles.input} placeholder={t('medications')} value={medications} onChangeText={setMedications} editable={consent} />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Notes" value={notes} onChangeText={setNotes} multiline editable={consent} />
      <TouchableOpacity style={[styles.btn, !consent && styles.disabled]} onPress={save} disabled={!consent}>
        <Text style={styles.btnText}>{t('save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  optional: { color: '#64748B', marginBottom: 16, fontSize: 13 },
  consentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, backgroundColor: '#FFF', padding: 12, borderRadius: 10 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 8 },
  btn: { backgroundColor: '#DC2626', padding: 14, borderRadius: 10, marginTop: 8 },
  disabled: { opacity: 0.5 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
});
