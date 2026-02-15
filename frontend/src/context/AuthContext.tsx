import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { AuthState, User } from '../types';

const AuthContext = createContext<AuthState | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(authApi.getUser());
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback((payload: Partial<{ access: string; refresh: string; user: User }>) => {
    authApi.setAuth(payload);
    setUser(payload?.user ?? null);
  }, []);

  const logout = useCallback(() => {
    authApi.clearAuth();
    setUser(null);
  }, []);

  useEffect(() => {
    const token = authApi.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => {
        if (u) setUser(u);
        else logout();
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const value: AuthState = {
    user,
    loading,
    setAuth,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
