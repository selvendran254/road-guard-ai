import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const slides = ['splash_tagline', 'how_sos_works', 'false_trigger'];

export default function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app_name')}</Text>
      {slides.map((key) => (
        <View key={key} style={styles.card}>
          <Text style={styles.cardText}>{t(key)}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.btnText}>{t('login')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>{t('signup')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#DC2626', marginBottom: 24, textAlign: 'center' },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardText: { fontSize: 15, color: '#334155', lineHeight: 22 },
  btn: { backgroundColor: '#DC2626', padding: 16, borderRadius: 12, marginTop: 16 },
  btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  link: { color: '#DC2626', textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
