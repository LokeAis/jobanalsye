import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * Premium entitlement.
 *
 * For now this is a local, manually-toggled flag (see `unlock`/`lock`) so the
 * gating structure and UI can be built and tested without a payment provider.
 * When real billing is added, replace the body of `readStoredPremium` /
 * `unlock` with verification of a license key or a server-side entitlement
 * check — the rest of the app only depends on the `isPremium` boolean.
 */

export const PREMIUM_STORAGE_KEY = 'bigfive_prep_premium';

interface PremiumContextValue {
  isPremium: boolean;
  unlock: () => void;
  lock: () => void;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

const readStoredPremium = (): boolean => {
  try {
    return localStorage.getItem(PREMIUM_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState<boolean>(readStoredPremium);

  // Keep state in sync if another tab toggles premium.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PREMIUM_STORAGE_KEY) setIsPremium(readStoredPremium());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const unlock = useCallback(() => {
    localStorage.setItem(PREMIUM_STORAGE_KEY, 'true');
    setIsPremium(true);
  }, []);

  const lock = useCallback(() => {
    localStorage.removeItem(PREMIUM_STORAGE_KEY);
    setIsPremium(false);
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, unlock, lock }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within a PremiumProvider');
  return ctx;
}
