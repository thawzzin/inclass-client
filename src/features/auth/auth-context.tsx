'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { User } from '@/src/lib/api/types';

import { authApi } from './auth.api';
import type { LoginValues } from './schemas';
import { restoreSession } from './session';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login(input: LoginValues): Promise<User>;
  logout(): Promise<void>;
  setUser(user: User | null): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    void restoreSession(authApi)
      .then((sessionUser) => {
        setUser(sessionUser);
        setStatus(sessionUser ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => setStatus('unauthenticated'));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      setUser,
      login: async (input) => {
        const sessionUser = await authApi.login(input);
        setUser(sessionUser);
        setStatus('authenticated');
        return sessionUser;
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
        setStatus('unauthenticated');
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
