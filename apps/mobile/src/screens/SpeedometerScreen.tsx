import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Accelerometer } from 'expo-sensors';
import { useThemedStyles } from '../hooks/useThemedStyles';

export default function SpeedometerScreen() {
  const { t } = useTranslation();
  const { theme, styles: ts } = useThemedStyles();
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(500);
    const sub = Accelerometer.addListener((d) => {
      const mag = Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2);
      setSpeed(Math.min(120, Math.round(mag * 12)));
    });
    return () => sub.remove();
  }, []);

  const color = speed > 80 ? '#DC2626' : speed > 60 ? '#D97706' : '#059669';

  return (
    <View style={[ts.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
      <Text style={ts.title}>{t('speedometer')}</Text>
      <Text style={{ fontSize: 96, fontWeight: '900', color }}>{speed}</Text>
      <Text style={{ color: theme.textMuted, fontSize: 18 }}>km/h (estimated)</Text>
      {speed > 80 && <Text style={{ color: '#DC2626', marginTop: 16, fontWeight: '700' }}>{t('speed_warning')}</Text>}
    </View>
  );
}
