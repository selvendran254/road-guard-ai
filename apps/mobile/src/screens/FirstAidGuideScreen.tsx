import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useThemedStyles } from '../hooks/useThemedStyles';

export default function FirstAidGuideScreen() {
  const { t, i18n } = useTranslation();
  const { theme, styles: ts } = useThemedStyles();
  const [guides, setGuides] = useState<{ title: string; steps: string[] }[]>([]);
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    api.getFirstAidGuides(i18n.language).then((r) => setGuides((r as { guides: typeof guides }).guides || []));
  }, [i18n.language]);

  const guide = guides[active];

  return (
    <ScrollView style={ts.container} contentContainerStyle={ts.scroll}>
      <Text style={ts.title}>{t('first_aid_interactive')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {guides.map((g, i) => (
          <TouchableOpacity
            key={g.title}
            onPress={() => { setActive(i); setStep(0); }}
            style={[ts.card, { marginRight: 8, paddingHorizontal: 14, borderColor: active === i ? theme.primary : theme.border }]}
          >
            <Text style={{ color: theme.text, fontWeight: '600' }}>{g.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {guide && (
        <View style={ts.card}>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>{t('step')} {step + 1}/{guide.steps.length}</Text>
          <Text style={{ color: theme.text, fontSize: theme.fontSize + 2, fontWeight: '700', marginVertical: 12 }}>
            {guide.steps[step]}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[ts.btn, { flex: 1, opacity: step === 0 ? 0.4 : 1 }]}
              disabled={step === 0}
              onPress={() => setStep((s) => s - 1)}
            >
              <Text style={ts.btnText}>{t('prev')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ts.btn, { flex: 1, backgroundColor: '#059669' }]}
              onPress={() => setStep((s) => Math.min(guide.steps.length - 1, s + 1))}
            >
              <Text style={ts.btnText}>{step >= guide.steps.length - 1 ? t('done') : t('next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
