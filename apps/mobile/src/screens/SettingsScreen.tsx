import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { session, refreshSession, logout } = useAuth();
  const settings = (session?.settings || {}) as Record<string, boolean | number | string>;

  const update = async (key: string, value: boolean | number | string) => {
    await api.updateSettings({ [key]: value });
    if (key === 'language') i18n.changeLanguage(value as string);
    await refreshSession();
  };

  const toggles = [
    { key: 'shareLocation', label: 'privacy_location' },
    { key: 'shareHealth', label: 'privacy_health' },
    { key: 'shareCamera', label: 'privacy_camera' },
    { key: 'shareEmergencyData', label: 'privacy_emergency' },
    { key: 'autoAccidentResponse', label: 'auto_accident' },
    { key: 'notificationsEnabled', label: 'notifications' },
    { key: 'darkMode', label: 'dark_mode' },
    { key: 'largeText', label: 'large_text' },
    { key: 'voiceCommands', label: 'voice_sos' },
    { key: 'geofenceAlerts', label: 'geofence_alerts' },
    { key: 'weatherAlerts', label: 'weather_alerts' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('settings')}</Text>

      <Text style={styles.section}>{t('language')}</Text>
      {(['en', 'ta', 'hi'] as const).map((lang) => (
        <TouchableOpacity key={lang} style={[styles.langBtn, settings.language === lang && styles.langActive]} onPress={() => update('language', lang)}>
          <Text style={settings.language === lang ? styles.langActiveText : styles.langText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.section}>{t('sos_duration')}: {settings.sosCountdownSeconds || 5}s</Text>
      <View style={styles.row}>
        {[3, 5, 7, 10].map((s) => (
          <TouchableOpacity key={s} style={[styles.durationBtn, settings.sosCountdownSeconds === s && styles.langActive]} onPress={() => update('sosCountdownSeconds', s)}>
            <Text style={settings.sosCountdownSeconds === s ? styles.langActiveText : styles.langText}>{s}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      {toggles.map((tg) => (
        <View key={tg.key} style={styles.toggleRow}>
          <Text>{t(tg.label)}</Text>
          <Switch value={!!settings[tg.key]} onValueChange={(v) => update(tg.key, v)} trackColor={{ true: '#DC2626' }} />
        </View>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert(t('logout'), '', [{ text: t('cancel'), style: 'cancel' }, { text: t('logout'), style: 'destructive', onPress: logout }])}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  section: { fontWeight: '700', marginTop: 16, marginBottom: 8, color: '#334155' },
  langBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8, marginBottom: 8, alignSelf: 'flex-start' },
  langActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  langText: { color: '#334155' },
  langActiveText: { color: '#FFF', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  durationBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  logoutBtn: { marginTop: 32, borderWidth: 2, borderColor: '#DC2626', borderRadius: 10, padding: 14 },
  logoutText: { color: '#DC2626', textAlign: 'center', fontWeight: '700' },
});
