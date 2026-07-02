import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'bigfive_prep_ai_consent';

/** Reads current AI-sharing consent (used by parent components to gate a button). */
export function hasAiConsent(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

interface AiConsentNoticeProps {
  onChange: (consented: boolean) => void;
}

/**
 * Shared, not-pre-checked consent checkbox for both AI features (job analysis and
 * interview simulator). Both send the same data categories (job info + Big Five
 * scores) to the same processor (Google Gemini) for the same purpose, so one shared
 * consent flag covers both. Persisted in localStorage (part of STORAGE_KEYS in
 * App.tsx, so it follows the per-account backup/restore mechanism automatically).
 */
export default function AiConsentNotice({ onChange }: AiConsentNoticeProps) {
  const [consented, setConsented] = useState<boolean>(() => hasAiConsent());

  const toggle = () => {
    const next = !consented;
    setConsented(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    onChange(next);
  };

  return (
    <label className="flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed cursor-pointer">
      <input
        type="checkbox"
        checked={consented}
        onChange={toggle}
        className="mt-0.5 w-3.5 h-3.5 accent-teal-700 shrink-0 cursor-pointer"
      />
      <span className="flex items-start gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Jeg samtykker til at stillingsinfo og mine Big Five-skårer sendes til{' '}
          <strong>Google Gemini</strong> for å generere denne rapporten. Ikke lim inn
          sensitive personopplysninger. Resten av appen fungerer 100&nbsp;% lokalt.
        </span>
      </span>
    </label>
  );
}
