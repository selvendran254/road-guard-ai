import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛡️</Text>
      <Text style={styles.title}>{t('app_name')}</Text>
      <Text style={styles.tagline}>{t('splash_tagline')}</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Onboarding')}>
        <Text style={styles.btnText}>{t('get_started')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DC2626', padding: 24 },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  tagline: { fontSize: 16, color: '#FEE2E2', marginTop: 8, textAlign: 'center' },
  btn: { marginTop: 48, backgroundColor: '#FFF', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#DC2626', fontWeight: '700', fontSize: 16 },
});
