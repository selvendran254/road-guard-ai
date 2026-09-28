export const colors = {
  primary: '#DC2626',
  primaryDark: '#991B1B',
  background: '#F8FAFC',
  backgroundDark: '#0F172A',
  card: '#FFFFFF',
  cardDark: '#1E293B',
  text: '#1E293B',
  textDark: '#F1F5F9',
  textMuted: '#64748B',
  success: '#059669',
  warning: '#D97706',
  border: '#E2E8F0',
};

export function getTheme(darkMode: boolean, largeText: boolean) {
  return {
    darkMode,
    bg: darkMode ? colors.backgroundDark : colors.background,
    card: darkMode ? colors.cardDark : colors.card,
    input: darkMode ? '#334155' : '#FFFFFF',
    text: darkMode ? colors.textDark : colors.text,
    textMuted: darkMode ? '#94A3B8' : colors.textMuted,
    border: darkMode ? '#334155' : colors.border,
    primary: colors.primary,
    fontSize: largeText ? 18 : 16,
    titleSize: largeText ? 28 : 24,
    sosSize: largeText ? 120 : 100,
  };
}
