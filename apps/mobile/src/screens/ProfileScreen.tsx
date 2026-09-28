import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useThemedStyles } from '../hooks/useThemedStyles';

export default function ProfileScreen({ navigation }: { navigation: { navigate: (s: string) => void } }) {
  const { t } = useTranslation();
  const { session, refreshSession } = useAuth();
  const { theme, styles: ts } = useThemedStyles();
  const profile = (session?.profile || {}) as Record<string, string | number>;
  const [name, setName] = useState(String(profile.name || ''));
  const [age, setAge] = useState(String(profile.age || ''));
  const [phone, setPhone] = useState(String(profile.phone || session?.phone || ''));
  const [address, setAddress] = useState(String(profile.address || ''));

  const save = async () => {
    await api.updateProfile({ name, age: parseInt(age) || undefined, phone, address });
    await refreshSession();
    Alert.alert('Saved', t('save'));
  };

  const links = [
    { screen: 'VehicleDetails', label: 'vehicle_details' },
    { screen: 'EmergencyContacts', label: 'emergency_contacts' },
    { screen: 'MedicalProfile', label: 'medical_profile' },
    { screen: 'Settings', label: 'settings' },
  ];

  return (
    <ScrollView style={ts.container} contentContainerStyle={ts.scroll}>
      <Text style={ts.title}>{t('profile')}</Text>
      <Text style={ts.label}>{t('name')}</Text>
      <TextInput style={ts.input} value={name} onChangeText={setName} placeholderTextColor={theme.textMuted} />
      <Text style={ts.label}>{t('age')}</Text>
      <TextInput style={ts.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholderTextColor={theme.textMuted} />
      <Text style={ts.label}>{t('phone')}</Text>
      <TextInput style={ts.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={theme.textMuted} />
      <Text style={ts.label}>{t('address')}</Text>
      <TextInput style={ts.input} value={address} onChangeText={setAddress} multiline placeholderTextColor={theme.textMuted} />
      <TouchableOpacity style={ts.btn} onPress={save}><Text style={ts.btnText}>{t('save')}</Text></TouchableOpacity>

      {links.map((l) => (
        <TouchableOpacity key={l.screen} style={ts.card} onPress={() => navigation.navigate(l.screen)}>
          <Text style={{ color: theme.text, fontWeight: '600' }}>→ {t(l.label)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
