import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function EmergencyContactsScreen() {
  const { t } = useTranslation();
  const { session, refreshSession } = useAuth();
  const contacts = (session?.emergencyContacts || []) as { id: string; name: string; phone: string; relationship: string }[];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const add = async () => {
    await api.addContact({ name, phone, relationship });
    await refreshSession();
    setName('');
    setPhone('');
    setRelationship('');
  };

  const remove = async (id: string) => {
    await api.deleteContact(id);
    await refreshSession();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('emergency_contacts')}</Text>
      {contacts.map((c) => (
        <View key={c.id} style={styles.card}>
          <Text style={styles.name}>{c.name}</Text>
          <Text style={styles.sub}>{c.phone} — {c.relationship}</Text>
          <TouchableOpacity onPress={() => remove(c.id)}><Text style={styles.delete}>{t('cancel')}</Text></TouchableOpacity>
        </View>
      ))}
      <Text style={styles.section}>{t('add_contact')}</Text>
      <TextInput style={styles.input} placeholder={t('name')} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder={t('phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Relationship" value={relationship} onChangeText={setRelationship} />
      <TouchableOpacity style={styles.btn} onPress={add}><Text style={styles.btnText}>{t('add_contact')}</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  name: { fontWeight: '700' },
  sub: { color: '#64748B', marginTop: 4 },
  delete: { color: '#DC2626', marginTop: 8 },
  section: { fontWeight: '700', marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 8 },
  btn: { backgroundColor: '#DC2626', padding: 14, borderRadius: 10 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
});
