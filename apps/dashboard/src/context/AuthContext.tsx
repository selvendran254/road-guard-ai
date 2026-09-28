import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
  login: (token: string, username: string, role: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(localStorage.getItem('authority_token'));
  const [username, setUsername] = useState(localStorage.getItem('authority_user'));
  const [role, setRole] = useState(localStorage.getItem('authority_role'));

  const login = (t: string, u: string, r: string) => {
    localStorage.setItem('authority_token', t);
    localStorage.setItem('authority_user', u);
    localStorage.setItem('authority_role', r);
    setToken(t);
    setUsername(u);
    setRole(r);
  };

  const logout = () => {
    localStorage.removeItem('authority_token');
    localStorage.removeItem('authority_user');
    localStorage.removeItem('authority_role');
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, role, login, logout, isAdmin: role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
