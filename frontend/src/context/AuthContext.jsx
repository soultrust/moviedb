import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authApi.getUser());
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback((payload) => {
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
    authApi.me()
      .then((u) => {
        if (u) setUser(u);
        else logout();
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const value = {
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
