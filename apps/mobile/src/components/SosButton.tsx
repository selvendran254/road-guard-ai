import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SosButton({ onPress, size = 100 }: { onPress: () => void; size?: number }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
      onPress={onPress}
      accessibilityLabel={t('sos')}
      accessibilityRole="button"
    >
      <Text style={styles.text}>{t('sos')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: '#991B1B',
  },
  text: { color: '#FFF', fontWeight: '900', fontSize: 24, letterSpacing: 2 },
});
