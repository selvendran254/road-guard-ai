import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';
import i18n from '../i18n';

interface Session {
  sessionId: string;
  phone: string;
  otpVerified?: boolean;
  profile: Record<string, unknown>;
  vehicles: unknown[];
  emergencyContacts: unknown[];
  medicalProfile: Record<string, unknown>;
  settings: Record<string, unknown>;
  reportsSubmitted: number;
  location?: { lat: number; lng: number };
}

interface AuthState {
  token: string | null;
  session: Session | null;
  loading: boolean;
  setToken: (t: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const data = await api.getSession();
    setSession(data as unknown as Session);
    const lang = (data as { settings?: { language?: string } }).settings?.language;
    if (lang) i18n.changeLanguage(lang);
  };

  useEffect(() => {
    AsyncStorage.getItem('auth_token').then(async (t) => {
      if (t) {
        setTokenState(t);
        try {
          await refreshSession();
        } catch {
          await AsyncStorage.removeItem('auth_token');
          setTokenState(null);
        }
      }
      setLoading(false);
    });
  }, []);

  const setToken = async (t: string) => {
    await AsyncStorage.setItem('auth_token', t);
    setTokenState(t);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      /* session may already be gone */
    }
    await AsyncStorage.removeItem('auth_token');
    setTokenState(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ token, session, loading, setToken, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth required');
  return ctx;
}
