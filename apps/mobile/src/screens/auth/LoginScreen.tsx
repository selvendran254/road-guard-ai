import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone) return Alert.alert('Error', 'Enter phone number');
    setLoading(true);
    try {
      const res = await api.login(phone);
      await setToken(res.token);
      navigation.navigate('OtpVerification', { token: res.token, otp: res.otp });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login')}</Text>
      <Text style={styles.label}>{t('phone')}</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91XXXXXXXXXX" />
      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.btnText}>{loading ? '...' : t('login')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>{t('signup')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24, color: '#1E293B' },
  label: { fontSize: 14, color: '#64748B', marginBottom: 6 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 16 },
  btn: { backgroundColor: '#DC2626', padding: 16, borderRadius: 12 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
  link: { color: '#DC2626', textAlign: 'center', marginTop: 16 },
});
