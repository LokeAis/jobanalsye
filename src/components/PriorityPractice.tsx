import React, { useState } from 'react';
import { statements, Statement } from '../data/statements';
import { Scale, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

interface PriorityPracticeProps {
  onNavigateToTab: (tabId: string) => void;
}

const PAIR_COUNT = 10;

/** Picks PAIR_COUNT pairs of Big Five statements (never integritet) where the two
 *  statements in a pair always come from DIFFERENT dimensions — a genuine trade-off,
 *  like a real forced-choice test. Purely for practice; nothing here is scored. */
function generatePairs(): [Statement, Statement][] {
  const pool = statements.filter((s) => s.dimensjon !== 'integritet');
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const used = new Set<string>();
  const pairs: [Statement, Statement][] = [];

  for (const s1 of shuffled) {
    if (pairs.length >= PAIR_COUNT) break;
    if (used.has(s1.id)) continue;
    const s2 = shuffled.find((c) => !used.has(c.id) && c.id !== s1.id && c.dimensjon !== s1.dimensjon);
    if (s2) {
      pairs.push([s1, s2]);
      used.add(s1.id);
      used.add(s2.id);
    }
  }
  return pairs;
}

export default function PriorityPractice({ onNavigateToTab }: PriorityPracticeProps) {
  const [pairs, setPairs] = useState<[Statement, Statement][]>(() => generatePairs());
  const [index, setIndex] = useState(0);

  const restart = () => {
    setPairs(generatePairs());
    setIndex(0);
  };

  const choose = () => setIndex((i) => i + 1);

  const isDone = index >= pairs.length;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700 text-xs font-semibold mb-3">
          <Scale className="w-3.5 h-3.5" />
          Ren trening — ikke skåret
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Prioriteringsøvelse</h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Noen ekte personlighetstester ber deg velge mellom to påstander i stedet for
          å skåre hver for seg («forced choice»). Øv på den formen her — dette påvirker
          ikke profilen din og lagres ikke.
        </p>
      </div>

      {!isDone ? (
        <>
          <div className="mb-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Par {index + 1} av {pairs.length}</span>
            <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(index / pairs.length) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-4 text-center">Hvilken påstand ligner mest på deg?</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {pairs[index].map((s, i) => (
              <button
                key={s.id}
                onClick={choose}
                className="bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 rounded-xl p-5 text-left transition cursor-pointer shadow-xs"
              >
                <span className="block text-[10px] font-bold text-slate-400 mb-2">{i === 0 ? 'A' : 'B'}</span>
                <span className="text-slate-800 text-sm sm:text-base leading-relaxed">{s.tekst}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Bra jobbet!</h3>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
              Dette var ren trening på å velge raskt under tvang — ingenting her ble
              lagret eller skåret. Vil du se din faktiske profil, er det spørreskjemaet
              som teller.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => onNavigateToTab('results')}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-5 rounded-lg transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
            >
              Se din faktiske profil
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={restart}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-5 rounded-lg transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Øv på nytt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
