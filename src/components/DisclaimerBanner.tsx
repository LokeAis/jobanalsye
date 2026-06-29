import React, { useState } from 'react';
import { AlertCircle, ChevronDown, X } from 'lucide-react';

const STORAGE_KEY = 'bigfive_prep_disclaimer_collapsed';

export default function DisclaimerBanner() {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const setAndStore = (value: boolean) => {
    setCollapsed(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  // Collapsed: a slim, always-present one-liner that can be re-expanded.
  if (collapsed) {
    return (
      <button
        id="disclaimer-banner"
        onClick={() => setAndStore(false)}
        className="w-full max-w-5xl mx-auto my-3 bg-amber-50/70 border border-amber-200/70 text-amber-900 px-4 py-2 rounded-lg flex items-center gap-2 text-xs hover:bg-amber-50 transition cursor-pointer"
        aria-expanded={false}
      >
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="flex-1 text-left font-medium">
          Kun for læring og refleksjon – ikke en offisiell test.
        </span>
        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold shrink-0">
          Vis mer
          <ChevronDown className="w-3.5 h-3.5" />
        </span>
      </button>
    );
  }

  return (
    <div
      id="disclaimer-banner"
      className="bg-amber-50/90 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg flex items-start gap-3 shadow-xs text-xs sm:text-sm max-w-5xl mx-auto my-4"
    >
      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <span className="font-semibold text-amber-950">Viktig informasjon:</span>{' '}
        Dette verktøyet er kun laget for læring og refleksjon. Det er ikke en offisiell MAP-test, ikke tilknyttet Assessio, og skal ikke brukes til å ta ansettelsesbeslutninger. Resultatene er ikke normerte og må ikke tolkes som en fasit.
      </div>
      <button
        onClick={() => setAndStore(true)}
        aria-label="Skjul informasjon"
        className="text-amber-600 hover:text-amber-800 transition cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
