import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export default function QRMedicalScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [qrPayload, setQrPayload] = useState('');
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.generateMedicalQr()
      .then((r) => {
        const res = r as { qrPayload: string; display: Record<string, string> };
        setQrPayload(res.qrPayload);
        setData(res.display);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>{t('medical_qr')}</Text>
      <Text style={[styles.sub, { color: theme.textMuted }]}>{t('medical_qr_hint')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data && qrPayload && (
        <View style={[styles.qrBox, { backgroundColor: theme.card, borderColor: theme.primary }]}>
          <QRCode value={qrPayload} size={200} backgroundColor={theme.card} color={theme.darkMode ? '#FFF' : '#1E293B'} />
          <Text style={[styles.name, { color: theme.text }]}>{data.name}</Text>
          <Text style={[styles.row, { color: theme.textMuted }]}>🩸 {data.bloodGroup || '—'}</Text>
          <Text style={[styles.row, { color: theme.textMuted }]}>⚠️ {data.allergies || 'None'}</Text>
          <Text style={[styles.row, { color: theme.textMuted }]}>💊 {data.medications || 'None'}</Text>
          <Text style={styles.disclaimer}>{data.disclaimer}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8, alignSelf: 'flex-start' },
  sub: { marginBottom: 16, alignSelf: 'flex-start' },
  error: { color: '#DC2626', marginBottom: 12, alignSelf: 'flex-start' },
  qrBox: { padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 2, width: '100%' },
  name: { fontSize: 20, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  row: { marginTop: 4, fontSize: 15 },
  disclaimer: { color: '#94A3B8', fontSize: 11, marginTop: 16, textAlign: 'center' },
});
