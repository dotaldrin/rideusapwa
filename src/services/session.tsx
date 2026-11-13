import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from '../infrastructure/http/apiFetch';
import type { AccountSession } from '../types/contracts';

interface SessionValue {
  /** null while the first /me probe is in flight. */
  session: AccountSession | null;
  isCustomer: boolean;
  refresh: () => Promise<AccountSession>;
  login: (email: string, password: string) => Promise<AccountSession>;
  logout: () => Promise<void>;
}

const anonymous: AccountSession = { isAuthenticated: false };
const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AccountSession | null>(null);

  const refresh = useCallback(async () => {
    try {
      const current = (await apiFetch<AccountSession>('/api/Account/me')) ?? anonymous;
      setSession(current);
      return current;
    } catch {
      setSession(anonymous);
      return anonymous;
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    // Customer accounts are created with the email as the user name.
    const current = await apiFetch<AccountSession>('/api/Account/login', {
      method: 'POST',
      body: JSON.stringify({ userName: email.trim(), password, rememberMe: true }),
    });
    setSession(current);
    return current;
  }, []);

  const logout = useCallback(async () => {
    try { await apiFetch('/api/Account/logout', { method: 'POST' }); } finally { setSession(anonymous); }
  }, []);

  const value = useMemo<SessionValue>(() => ({
    session,
    isCustomer: !!session?.isAuthenticated && !!session.roles?.includes('Customer'),
    refresh, login, logout,
  }), [session, refresh, login, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider.');
  return value;
}
