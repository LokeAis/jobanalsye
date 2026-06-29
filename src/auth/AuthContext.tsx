import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  User,
} from 'firebase/auth';
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from './firebase';

interface AuthContextValue {
  /** Whether Firebase is configured in this build at all. */
  configured: boolean;
  /** Still resolving the initial auth state. */
  loading: boolean;
  user: User | null;
  /** Credit balance ("klipp"), or null until known. */
  credits: number | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  /** fetch() wrapper that attaches the Firebase ID token. */
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) setCredits(null);
    });
    return unsub;
  }, []);

  const authedFetch = useCallback(async (input: string, init: RequestInit = {}) => {
    const auth = getFirebaseAuth();
    const current = auth?.currentUser;
    const headers = new Headers(init.headers || {});
    if (current) {
      const token = await current.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }, []);

  const refreshCredits = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) {
      setCredits(null);
      return;
    }
    try {
      const res = await authedFetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setCredits(typeof data.credits === 'number' ? data.credits : 0);
      }
    } catch {
      /* leave credits as-is on transient errors */
    }
  }, [authedFetch]);

  // Load credits whenever the user changes.
  useEffect(() => {
    if (user) refreshCredits();
  }, [user, refreshCredits]);

  const signIn = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await fbSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        configured: isFirebaseConfigured,
        loading,
        user,
        credits,
        signIn,
        signOut,
        refreshCredits,
        authedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
