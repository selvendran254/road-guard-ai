import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getTheme } from '../theme';

type Theme = ReturnType<typeof getTheme>;

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const settings = (session?.settings || {}) as { darkMode?: boolean; largeText?: boolean };
  const theme = useMemo(
    () => getTheme(!!settings.darkMode, !!settings.largeText),
    [settings.darkMode, settings.largeText]
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return getTheme(false, false);
  return ctx;
}
