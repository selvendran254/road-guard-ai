import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function HelpGuideScreen() {
  const { t } = useTranslation();
  const sections = [
    { title: t('how_sos_works'), body: 'Tap SOS → countdown (3-10s) → "Are you safe?" → if no response, emergency dispatch begins. Always confirm to avoid false triggers.' },
    { title: t('false_trigger'), body: 'Tap "I\'m Safe" during countdown or confirm screen to cancel. On active emergency, use Cancel with re-confirmation.' },
    { title: t('first_aid_tips'), body: '1. Check consciousness\n2. Call for help\n3. Do not move injured unless in danger\n4. Apply pressure to bleeding\n5. Keep warm' },
    { title: t('support_contact'), body: 'support@roadguard.ai | Emergency: Use SOS button' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('help_guide')}</Text>
      {sections.map((s) => (
        <View key={s.title} style={styles.card}>
          <Text style={styles.cardTitle}>{s.title}</Text>
          <Text style={styles.body}>{s.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8, color: '#DC2626' },
  body: { color: '#334155', lineHeight: 22 },
});
