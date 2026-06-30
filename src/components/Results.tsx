import React, { useState } from 'react';
import { statements, DimensionKey, dimensionsData, bandsData } from '../data/statements';
import { ChevronRight, Sparkles, AlertTriangle, HelpCircle, Lock } from 'lucide-react';

interface ResultsProps {
  answers: Record<string, number>;
  onNavigateToTab: (tabId: string) => void;
}

export default function Results({ answers, onNavigateToTab }: ResultsProps) {
  const [activeDimKey, setActiveDimKey] = useState<DimensionKey>('planmessighet');

  // Verify completeness
  const totalStatementsCount = statements.length;
  const answeredCount = statements.filter(s => answers[s.id] !== undefined).length;
  const isCompleted = answeredCount === totalStatementsCount;

  // 1. Lock Screen (If questionnaire is not finished)
  if (!isCompleted) {
    return (
      <div id="results-locked" className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-slate-200/60 rounded-xl p-8 shadow-xs">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Rapporten er ikke klar ennå</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Rapporten og analysen din blir tilgjengelig så snart du har fullført alle 60 påstandene i spørreskjemaet. Du har svart på{' '}
            <strong className="text-slate-900">{answeredCount} av 60</strong> påstander så langt.
          </p>

          <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((answeredCount / totalStatementsCount) * 100)}%` }}
            />
          </div>

          <button
            onClick={() => onNavigateToTab('questionnaire')}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-xs cursor-pointer"
          >
            Fortsett der du slapp
          </button>
        </div>
      </div>
    );
  }

  // Calculate scores for each dimension
  const getScore = (dim: DimensionKey): number => {
    const dimStatements = statements.filter(s => s.dimensjon === dim);
    let sum = 0;
    dimStatements.forEach(s => {
      const ans = answers[s.id] || 3; // fallback to neutral if undefined (should not happen when isCompleted)
      const actualVal = s.keyed === 'negativ' ? (6 - ans) : ans;
      sum += actualVal;
    });
    return Number((sum / dimStatements.length).toFixed(1));
  };

  const getBand = (score: number): 'Lav' | 'Moderat' | 'Høy' => {
    if (score <= 2.6) return 'Lav';
    if (score >= 3.7) return 'Høy';
    return 'Moderat';
  };

  const getBandColor = (band: 'Lav' | 'Moderat' | 'Høy') => {
    switch (band) {
      case 'Lav':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'Moderat':
        return 'bg-teal-50 border-teal-200 text-teal-800';
      case 'Høy':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
    }
  };

  const scores: Record<DimensionKey, number> = {
    planmessighet: getScore('planmessighet'),
    emosjonell_stabilitet: getScore('emosjonell_stabilitet'),
    ekstroversjon: getScore('ekstroversjon'),
    omgjengelighet: getScore('omgjengelighet'),
    aapenhet: getScore('aapenhet')
  };

  const activeScore = scores[activeDimKey];
  const activeBand = getBand(activeScore);
  const activeContent = bandsData[activeDimKey][activeBand];
  const activeInfo = dimensionsData[activeDimKey];

  // Rank dimensions from highest to lowest score
  const rankedDimensions = (Object.keys(scores) as DimensionKey[])
    .map((key) => ({
      key,
      name: dimensionsData[key].name,
      score: scores[key],
      band: getBand(scores[key]),
    }))
    .sort((a, b) => b.score - a.score);

  const strongestTrait = rankedDimensions[0];
  const weakestTrait = rankedDimensions[rankedDimensions.length - 1];

  return (
    <div id="results-dashboard" className="max-w-5xl mx-auto py-6 px-4">
      
      {/* Intro Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Din Refleksjonsrapport
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Basert på dine svar har vi estimert dine tendenser på de fem dimensjonene. 
          Bruk denne rapporten til å forstå dine naturlige styrker og fallgruver på jobb, og bli tryggere før intervjuet.
        </p>
      </div>

      {/* Visible Disclaimer */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Viktig presisering:</strong> Profilen din er <strong>IKKE normert mot en referansegruppe</strong>. Resultatene og båndene (Lav/Moderat/Høy) er utelukkende ment som et pedagogisk og veiledende refleksjonsverktøy, og er ikke diagnostiske eller kliniske vurderinger.
        </p>
      </div>

      {/* Relative Profile Ranking View */}
      <div className="mb-8 bg-white border border-slate-100 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
          <h3 className="font-bold text-slate-950 text-base sm:text-lg">
            Relativ Profil (Rangerte personlighetstrekk)
          </h3>
        </div>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
          Ved å rangere dimensjonene dine fra høyest til lavest skår kan vi se hvilke personlighetstrekk som er mest fremtredende hos deg relativt sett. Dette gir verdifull selvinnsikt uavhengig av de absolutte grensene:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {rankedDimensions.map((item, index) => {
            const isStrongest = item.key === strongestTrait.key;
            const isWeakest = item.key === weakestTrait.key;
            const isActive = activeDimKey === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setActiveDimKey(item.key)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between h-full transition relative cursor-pointer group hover:shadow-xs ${
                  isStrongest
                    ? 'bg-indigo-50/45 border-indigo-200 hover:border-indigo-300 ring-1 ring-indigo-500/20'
                    : isWeakest
                    ? 'bg-amber-50/35 border-amber-200 hover:border-amber-300 ring-1 ring-amber-500/15'
                    : 'bg-slate-50/40 border-slate-200/60 hover:bg-slate-50'
                } ${isActive ? 'ring-2 ring-slate-900/60' : ''}`}
              >
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400">RANG #{index + 1}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isStrongest
                        ? 'bg-indigo-100 text-indigo-900'
                        : isWeakest
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      Skår: {item.score}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition mb-1 leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-slate-500 text-[11px] mb-3">
                    Bånd: <span className="font-semibold text-slate-700">{item.band}</span>
                  </p>
                </div>

                <div className="w-full mt-auto pt-2 border-t border-slate-100/60">
                  {isStrongest && (
                    <span className="block text-center text-[9px] font-extrabold uppercase tracking-wider py-1 bg-indigo-600 text-white rounded-md">
                      ⭐ Ditt sterkeste trekk
                    </span>
                  )}
                  {isWeakest && (
                    <span className="block text-center text-[9px] font-extrabold uppercase tracking-wider py-1 bg-amber-600 text-white rounded-md">
                      ⚠️ Ditt svakeste trekk
                    </span>
                  )}
                  {!isStrongest && !isWeakest && (
                    <span className="block text-center text-[9px] font-medium text-slate-400 py-1">
                      Mellomliggende trekk
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left sidebar scores list, Right sidebar details card */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Score Summary List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs">
            <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider mb-4 px-1">
              Dine dimensjonsskårer
            </h3>
            
            <div className="space-y-3">
              {(Object.keys(scores) as DimensionKey[]).map((key) => {
                const score = scores[key];
                const band = getBand(score);
                const name = dimensionsData[key].name;
                const isActive = activeDimKey === key;

                return (
                  <button
                    key={key}
                    id={`btn-select-result-${key}`}
                    onClick={() => setActiveDimKey(key)}
                    className={`w-full text-left p-3.5 rounded-lg border transition cursor-pointer flex flex-col gap-2 ${
                      isActive 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                        : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/70 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-sm sm:text-base">{name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white/20">
                          {score}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          isActive 
                            ? 'bg-white/10 border-white/20 text-white' 
                            : getBandColor(band)
                        }`}>
                          {band}
                        </span>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition ${isActive ? 'translate-x-0.5' : 'text-slate-400'}`} />
                      </div>
                    </div>

                    {/* Small horizontal gauge visually representing score */}
                    <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${isActive ? 'bg-teal-400' : 'bg-teal-600'}`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 text-sm space-y-3 text-slate-600">
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Metode og Skåring</h4>
            <p className="text-xs leading-relaxed">
              Skåren beregnes som gjennomsnittet (1.0–5.0) av de 12 leddene i hver dimensjon, etter at negative ledd er snudd (reversert) slik at alle peker samme retning.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px] font-semibold">
              <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-md py-1">Lav: ≤2.6</div>
              <div className="bg-teal-50 text-teal-800 border border-teal-100 rounded-md py-1">Moderat: 2.7–3.6</div>
              <div className="bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-md py-1">Høy: ≥3.7</div>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed analysis of active score (7 cols on lg) */}
        <div id="results-detail-panel" className="lg:col-span-7 bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Active Dimension Header */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950">
                {activeInfo.name}
              </h3>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-lg font-bold bg-slate-100 text-slate-800 px-3 py-0.5 rounded-md">
                  {activeScore}
                </span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getBandColor(activeBand)}`}>
                  Estimerte tendens: {activeBand}
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm italic">
              {activeInfo.description}
            </p>
          </div>

          {/* Visual Gauge of the Selected Score */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-2 px-1">
              <span>LAV (1.0 - 2.6)</span>
              <span>MODERAT (2.7 - 3.6)</span>
              <span>HØY (3.7 - 5.0)</span>
            </div>
            
            {/* Horizontal timeline scale with mark boundaries */}
            <div className="relative w-full h-4 bg-slate-200 rounded-full">
              {/* Boundary markers */}
              <div className="absolute left-[40%] top-0 bottom-0 w-0.5 bg-white z-10" title="Grense Lav-Moderat (2.6)" /> {/* 2.6 / 5.0 = 52% but visual alignment: 2.6 is 40% of scale of 1-5? Let's check math: 1.0 is left, 5.0 is right. Range is 4.0. 2.6 is (2.6-1)/4 = 40% of range. 3.6 is (3.6-1)/4 = 65% of range. Perfect! */}
              <div className="absolute left-[65%] top-0 bottom-0 w-0.5 bg-white z-10" title="Grense Moderat-Høy (3.6)" />
              
              {/* Colored segment overlay */}
              <div className="absolute left-0 top-0 bottom-0 right-[60%] bg-amber-200/55 rounded-l-full" />
              <div className="absolute left-[40%] top-0 bottom-0 right-[35%] bg-teal-200/55" />
              <div className="absolute left-[65%] top-0 bottom-0 right-0 bg-indigo-200/55 rounded-r-full" />

              {/* Indicator thumb */}
              <div 
                className="absolute w-6 h-6 bg-slate-900 border-2 border-white rounded-full -top-1 shadow-md -ml-3 flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                style={{ left: `${((activeScore - 1) / 4) * 100}%` }}
              >
                {activeScore}
              </div>
            </div>
            <p className="text-center text-[11px] text-slate-500 mt-2.5">
              Ditt gjennomsnittlige svarnivå ligger i det <strong>{activeBand.toLowerCase()}</strong> området.
            </p>
          </div>

          {/* Detailed Interpretation */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Kort tolkning
            </h4>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {activeContent.interpretation}
            </p>
          </div>

          {/* Strengths & Pitfalls Grid */}
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2.5">
              <h4 className="font-semibold text-emerald-950 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Mulige styrker på jobb
              </h4>
              <ul className="space-y-1.5">
                {activeContent.strengths.map((strength, i) => (
                  <li key={i} className="text-slate-600 text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-semibold text-amber-950 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Mulige fallgruver
              </h4>
              <ul className="space-y-1.5">
                {activeContent.pitfalls.map((pitfall, i) => (
                  <li key={i} className="text-slate-600 text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interview preparation reflection questions */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Refleksjonsspørsmål før intervju
            </h4>
            <p className="text-slate-500 text-xs">
              Tenk igjennom disse spørsmålene på forhånd. De hjelper deg å formulere konkrete svar hvis rekruttereren spør om din personlighetstendens.
            </p>
            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 space-y-2.5">
              {activeContent.reflectionQuestions.map((q, i) => (
                <p key={i} className="text-slate-700 text-sm leading-relaxed flex items-start gap-2 italic">
                  <span className="text-slate-400 font-bold shrink-0">?</span>
                  <span>"{q}"</span>
                </p>
              ))}
            </div>
          </div>

          {/* Quick link to other features */}
          <div className="bg-teal-50 border border-teal-100/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
            <div>
              <h5 className="font-semibold text-teal-950 text-xs uppercase tracking-wider">Neste Steg: Intervjutrening</h5>
              <p className="text-teal-900 text-xs mt-0.5">
                Vi har skreddersydd konkrete eksempelsvar og oppfølgingsspørsmål basert på profilen din.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('interview-prep')}
              className="bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
            >
              Start forberedelse
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
