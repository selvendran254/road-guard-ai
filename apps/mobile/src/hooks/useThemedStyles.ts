import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function useThemedStyles() {
  const theme = useTheme();
  return {
    theme,
    styles: StyleSheet.create({
      container: { flex: 1, backgroundColor: theme.bg },
      scroll: { padding: 16, paddingBottom: 32 },
      title: { fontSize: theme.titleSize, fontWeight: '800', color: theme.text, marginBottom: 12 },
      subtitle: { color: theme.textMuted, marginBottom: 16, fontSize: theme.fontSize - 2 },
      card: {
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.border,
      },
      input: {
        backgroundColor: theme.input,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        padding: 12,
        fontSize: theme.fontSize,
        color: theme.text,
        marginBottom: 8,
      },
      label: { fontSize: 13, color: theme.textMuted, marginBottom: 4, marginTop: 8 },
      btn: { backgroundColor: theme.primary, padding: 14, borderRadius: 10, marginTop: 8 },
      btnText: { color: '#FFF', textAlign: 'center', fontWeight: '700', fontSize: theme.fontSize },
      link: { color: theme.primary, fontWeight: '600', marginTop: 12 },
      row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      empty: { color: theme.textMuted, textAlign: 'center', marginTop: 32 },
    }),
  };
}
