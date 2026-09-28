import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export default function OtpScreen({ route }: Props) {
  const { t } = useTranslation();
  const { refreshSession } = useAuth();
  const [otp, setOtp] = useState(route.params?.otp || '');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await api.verifyOtp(route.params.token, otp);
      await refreshSession();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('verify_otp')}</Text>
      <Text style={styles.sub}>{t('otp_sent')}</Text>
      <TextInput style={styles.input} value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder={t('enter_otp')} maxLength={6} />
      <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
        <Text style={styles.btnText}>{loading ? '...' : t('verify_otp')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, color: '#1E293B' },
  sub: { color: '#64748B', marginBottom: 24 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 14, fontSize: 24, letterSpacing: 8, textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#DC2626', padding: 16, borderRadius: 12 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700' },
});
