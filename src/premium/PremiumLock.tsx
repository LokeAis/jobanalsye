import React from 'react';
import { Lock, Sparkles, Check } from 'lucide-react';
import { usePremium } from './PremiumContext';

interface PremiumLockProps {
  title: string;
  description: string;
  benefits?: string[];
}

/**
 * Drop-in overlay shown in place of a premium-only feature when the user is not
 * premium. The dev/manual unlock lives in the Personvern tab; here we just point
 * the user there. Replace the unlock CTA with a real checkout link when billing
 * is wired up.
 */
export default function PremiumLock({ title, description, benefits }: PremiumLockProps) {
  const { unlock } = usePremium();

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white border border-amber-200/70 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5">
        <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-amber-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PREMIUM</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
        </div>

        {benefits && benefits.length > 0 && (
          <ul className="text-left text-sm text-slate-600 space-y-2 bg-slate-50 border border-slate-100 rounded-xl p-4">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2 pt-1">
          <button
            onClick={unlock}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Lås opp premium
          </button>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Foreløpig en gratis utviklertilgang (ingen betaling). Ekte kjøp kobles på senere.
          </p>
        </div>
      </div>
    </div>
  );
}
