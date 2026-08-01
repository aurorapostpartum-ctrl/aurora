import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { PEOPLE } from '../data/company';
import { storage } from '../lib/storage';
import type { Person } from '../types/domain';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

const SESSION_KEY = 'sitevault.session.personId';

// SiteVault runs on a self-contained demo company (Northline Construction),
// so authentication is a local lookup against the seeded roster rather than
// a hosted backend. Any of the seeded accounts uses this shared password.
export const DEMO_PASSWORD = 'sitevault';

interface AuthContextValue {
  status: AuthStatus;
  person: Person | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAs: (personId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [person, setPerson] = useState<Person | null>(null);

  useEffect(() => {
    let mounted = true;
    storage.getItem(SESSION_KEY).then((id) => {
      if (!mounted) return;
      const found = id ? PEOPLE.find((p) => p.id === id) : undefined;
      setPerson(found ?? null);
      setStatus(found ? 'signedIn' : 'signedOut');
    });
    return () => {
      mounted = false;
    };
  }, []);

  const applySession = useCallback(async (found: Person) => {
    await storage.setItem(SESSION_KEY, found.id);
    setPerson(found);
    setStatus('signedIn');
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const match = PEOPLE.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!match) {
        return { error: 'No SiteVault account found with that email.' };
      }
      if (password !== DEMO_PASSWORD) {
        return { error: 'Incorrect password.' };
      }
      await applySession(match);
      return { error: null };
    },
    [applySession]
  );

  const signInAs = useCallback(
    async (personId: string) => {
      const match = PEOPLE.find((p) => p.id === personId);
      if (match) await applySession(match);
    },
    [applySession]
  );

  const signOut = useCallback(async () => {
    await storage.removeItem(SESSION_KEY);
    setPerson(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, person, signInWithPassword, signInAs, signOut }),
    [status, person, signInWithPassword, signInAs, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
