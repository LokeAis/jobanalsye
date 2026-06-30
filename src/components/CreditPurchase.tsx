import React, { useEffect, useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from '../ui/Feedback';

interface CreditPackage {
  id: string;
  credits: number;
  amountNok: number;
  label: string;
  badge?: string;
}

/**
 * Self-service purchase of credits ("klipp") via Stripe Checkout.
 * Fetches packages from the server (single source of truth for prices) and
 * redirects to Stripe's hosted checkout. Credits are granted by the signed
 * webhook after payment — never client-side.
 */
export default function CreditPurchase({ compact = false }: { compact?: boolean }) {
  const { user, signIn, authedFetch } = useAuth();
  const { toast } = useFeedback();

  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/credit-packages')
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setConfigured(Boolean(data?.configured));
        setPackages(Array.isArray(data?.packages) ? data.packages : []);
      })
      .catch(() => active && setConfigured(false));
    return () => {
      active = false;
    };
  }, []);

  const buy = async (pkg: CreditPackage) => {
    if (!user) {
      signIn();
      return;
    }
    setBusyId(pkg.id);
    try {
      const res = await authedFetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Kunne ikke starte betaling.');
      }
      window.location.href = data.url;
    } catch (err: any) {
      toast(err?.message || 'Noe gikk galt. Prøv igjen.', 'error');
      setBusyId(null);
    }
  };

  if (configured === null) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Laster kjøpsalternativer…
      </div>
    );
  }

  // Prices are always shown (single source of truth from the server). When Stripe
  // isn't live yet, buttons are disabled and a "coming soon" note is shown.
  const comingSoon = configured === false;

  return (
    <div className="space-y-3">
      {comingSoon && (
        <p className="text-xs sm:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Kjøp av klipp åpner snart. Ta kontakt om du trenger flere klipp i mellomtiden.
        </p>
      )}
      <div className={compact ? 'space-y-2' : 'grid sm:grid-cols-3 gap-3'}>
      {packages.map((pkg) => {
        const perClip = Math.round(pkg.amountNok / pkg.credits);
        return (
          <button
            key={pkg.id}
            onClick={() => buy(pkg)}
            disabled={busyId !== null || comingSoon}
            title={comingSoon ? 'Kjøp åpner snart' : undefined}
            className={`relative flex items-center justify-between gap-3 bg-white rounded-xl p-4 transition text-left disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
              pkg.badge
                ? 'border-2 border-amber-300 hover:border-amber-400 hover:bg-amber-50/40'
                : 'border border-amber-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            {pkg.badge && (
              <span className="absolute -top-2 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pkg.badge}
              </span>
            )}
            <span className="flex items-center gap-3">
              <span className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                {busyId === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
              </span>
              <span>
                <span className="block font-semibold text-slate-900 text-sm">{pkg.label}</span>
                {pkg.credits > 1 && (
                  <span className="block text-xs text-slate-500">{perClip} kr per klipp</span>
                )}
              </span>
            </span>
            <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{pkg.amountNok} kr</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
