import React, { useState } from 'react';
import { Info, ChevronDown, X } from 'lucide-react';

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
        className="w-full max-w-5xl mx-auto my-3 bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-xs hover:bg-slate-100 transition cursor-pointer"
        aria-expanded={false}
      >
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="flex-1 text-left font-medium">
          Kun for læring og refleksjon – ikke en offisiell test.
        </span>
        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold shrink-0">
          Vis mer
          <ChevronDown className="w-3.5 h-3.5" />
        </span>
      </button>
    );
  }

  return (
    <div
      id="disclaimer-banner"
      className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-3 rounded-lg flex items-start gap-3 text-xs sm:text-sm max-w-5xl mx-auto my-4"
    >
      <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <span className="font-semibold text-slate-800">God å vite:</span>{' '}
        Dette er et uavhengig øvings- og refleksjonsverktøy. Det er ikke en offisiell test, bruker ikke faktiske testledd fra MAP, OPQ, Aon/cut-e eller andre proprietære tester, og er ikke tilknyttet Assessio, SHL, Aon eller andre testleverandører. Resultatene er ikke normerte og skal ikke brukes til ansettelsesbeslutninger.
      </div>
      <button
        onClick={() => setAndStore(true)}
        aria-label="Skjul informasjon"
        className="text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
