import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { PEOPLE } from '../data/company';
import { storage } from '../lib/storage';
import type { Person } from '../types/domain';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

const SESSION_KEY = 'sitevault.session.personId';
const PASSWORDS_KEY = 'sitevault.mockPasswords';

// SiteVault runs on a self-contained demo company (Northline Construction),
// so authentication is a local lookup against the seeded roster rather than
// a hosted backend. Every seeded account starts on this shared password
// until it's changed via the reset-password flow, at which point its
// per-account override (keyed by person id) takes precedence.
export const DEMO_PASSWORD = 'sitevault';

interface AuthContextValue {
  status: AuthStatus;
  person: Person | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAs: (personId: string) => Promise<void>;
  signOut: () => Promise<void>;
  accountExists: (email: string) => boolean;
  resetPassword: (email: string, newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [person, setPerson] = useState<Person | null>(null);
  const passwordOverridesRef = useRef<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    Promise.all([storage.getItem(SESSION_KEY), storage.getItem(PASSWORDS_KEY)]).then(
      ([sessionId, rawPasswords]) => {
        if (!mounted) return;
        if (rawPasswords) {
          try {
            passwordOverridesRef.current = JSON.parse(rawPasswords);
          } catch {
            passwordOverridesRef.current = {};
          }
        }
        const found = sessionId ? PEOPLE.find((p) => p.id === sessionId) : undefined;
        setPerson(found ?? null);
        setStatus(found ? 'signedIn' : 'signedOut');
      }
    );
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
      const expectedPassword = passwordOverridesRef.current[match.id] ?? DEMO_PASSWORD;
      if (password !== expectedPassword) {
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

  const accountExists = useCallback((email: string) => {
    return PEOPLE.some((p) => p.email.toLowerCase() === email.trim().toLowerCase());
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    const match = PEOPLE.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) {
      return { error: 'No SiteVault account found with that email.' };
    }
    const next = { ...passwordOverridesRef.current, [match.id]: newPassword };
    passwordOverridesRef.current = next;
    await storage.setItem(PASSWORDS_KEY, JSON.stringify(next));
    return { error: null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      person,
      signInWithPassword,
      signInAs,
      signOut,
      accountExists,
      resetPassword,
    }),
    [status, person, signInWithPassword, signInAs, signOut, accountExists, resetPassword]
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
