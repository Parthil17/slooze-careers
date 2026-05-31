'use client';

import { AuthUser, Country, Permission, Role } from '@slooze/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { hasPermission } from '@slooze/shared';

interface AuthState {
  user: AuthUser | null;
  permissions: Permission[];
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data } = await api.get<{ permissions: Permission[] } & AuthUser>('/users/me');
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      country: data.country,
    });
    setPermissions(data.permissions ?? []);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      refreshProfile()
        .catch(() => {
          localStorage.clear();
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart_order_id');
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  const can = useCallback(
    (permission: Permission) =>
      user ? hasPermission(user.role, permission) : false,
    [user],
  );

  const value = useMemo(
    () => ({ user, permissions, token, loading, login, logout, can, refreshProfile }),
    [user, permissions, token, loading, can, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAuth() {
  const auth = useAuth();
  return auth;
}

export { Role, Country, Permission };
