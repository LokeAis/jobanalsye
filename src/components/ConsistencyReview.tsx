import React, { useState } from 'react';
import { statements, consistencyPairs, DimensionKey, dimensionsData, bandsData, computeDimensionScore, getBand, effectiveAnswer } from '../data/statements';
import { ShieldCheck, AlertCircle, HelpCircle, Check, ArrowRight, Lock, Timer, Award, MessageSquare, HelpCircle as HelpIcon } from 'lucide-react';

interface ConsistencyReviewProps {
  answers: Record<string, number>;
  onNavigateToTab: (tabId: string) => void;
}

export default function ConsistencyReview({ answers, onNavigateToTab }: ConsistencyReviewProps) {
  const [activePrepDimKey, setActivePrepDimKey] = useState<DimensionKey>('planmessighet');

  // Verify completeness
  const totalStatementsCount = statements.length;
  const answeredCount = statements.filter(s => answers[s.id] !== undefined).length;
  const isCompleted = answeredCount === totalStatementsCount;

  // Retrieve guesses and test mode
  const guesses = React.useMemo<Record<DimensionKey, number>>(() => {
    const saved = localStorage.getItem('bigfive_prep_guesses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      planmessighet: 3,
      emosjonell_stabilitet: 3,
      ekstroversjon: 3,
      omgjengelighet: 3,
      aapenhet: 3
    };
  }, []);

  const testMode = React.useMemo<'standard' | 'realistic'>(() => {
    return (localStorage.getItem('bigfive_prep_mode') as 'standard' | 'realistic') || 'standard';
  }, []);

  // 1. Lock Screen (If questionnaire is not finished)
  if (!isCompleted) {
    return (
      <div id="consistency-locked" className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-slate-200/60 rounded-xl p-8 shadow-xs">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Debrief-rapporten er låst</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Rapporten og debriefen genereres så snart du har fullført generalprøven. Vi sjekker din selvinnsikt, konsistens, og gir deg ferdige intervjuspørsmål.
          </p>

          <button
            onClick={() => onNavigateToTab('questionnaire')}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-xs cursor-pointer"
          >
            Fortsett generalprøven
          </button>
        </div>
      </div>
    );
  }

  // Answer labels helper
  const getAnswerText = (val: number) => {
    switch (val) {
      case 1: return 'Helt uenig (1)';
      case 2: return 'Litt uenig (2)';
      case 3: return 'Verken eller (3)';
      case 4: return 'Litt enig (4)';
      case 5: return 'Helt enig (5)';
      default: return '';
    }
  };

  // Helper to calculate score per dimension
  const getScore = (dim: DimensionKey): number => computeDimensionScore(dim, answers);

  // Evaluate consistency pairs
  const evaluatedPairs = consistencyPairs.map((pair) => {
    const st1 = statements.find(s => s.id === pair.st1Id)!;
    const st2 = statements.find(s => s.id === pair.st2Id)!;

    const rawAns1 = answers[pair.st1Id] ?? 3;
    const rawAns2 = answers[pair.st2Id] ?? 3;
    const score1 = effectiveAnswer(st1, rawAns1);
    const score2 = effectiveAnswer(st2, rawAns2);

    const diff = Math.abs(score1 - score2);
    const spriker = diff >= 3;

    return {
      ...pair,
      st1,
      st2,
      rawAns1,
      rawAns2,
      score1,
      score2,
      diff,
      spriker
    };
  });

  const flaggedCount = evaluatedPairs.filter(p => p.spriker).length;

  // Find dimensions with big self-insight gaps (diff >= 1.0)
  const selfInsightGaps = (Object.keys(dimensionsData) as DimensionKey[]).map(key => {
    const actual = getScore(key);
    const guess = guesses[key] || 3;
    const diff = Math.abs(actual - guess);
    return { key, actual, guess, diff, name: dimensionsData[key].name };
  });

  const bigGaps = selfInsightGaps.filter(g => g.diff >= 1.0);

  return (
    <div id="consistency-review-view" className="max-w-5xl mx-auto py-6 px-4 space-y-12">
      
      {/* 1. Header & Intro */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Award className="w-40 h-40" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold font-mono">
            <span>GENERALPRØVE · DEBRIEF</span>
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Din personlige debriefing-rapport
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Dette er din generalprøve-oppsummering. Vi analyserer ikke bare profilen din, men sjekker hvor konsekvent du svarer, og sammenligner svarene med ditt eget selvbilde. Dette avslører hvor en ekte test eller en rekrutterer vil utfordre deg under intervjuet.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-400">
            <span>Modus: <strong className="text-white uppercase">{testMode === 'realistic' ? 'Realistisk ⏱️' : 'Standard'}</strong></span>
            <span>•</span>
            <span>Svart på: <strong className="text-white">{statements.length} av {statements.length} påstander</strong></span>
            <span>•</span>
            <span>Kontekst: <strong className="text-white">Arbeidshverdagen</strong></span>
          </div>
        </div>
      </div>

      {/* 2. SELVINNSIKT-KALIBRERING (Gjett-så-avslør) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Timer className="w-5.5 h-5.5 text-indigo-600" />
            1. Selvinnsikt-kalibrering (Selvbilde vs. Svar)
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1">
            Før generalprøven gjettet du din egen skår på hver dimensjon. Her sammenligner vi dette estimatet med det faktiske svarmønsteret ditt. Store sprik indikerer blindsoner i selvbilde som rekrutterere ofte belyser.
          </p>
        </div>

        {/* Visual Axis Comparison */}
        <div className="grid md:grid-cols-5 gap-6">
          {(Object.keys(dimensionsData) as DimensionKey[]).map((key) => {
            const name = dimensionsData[key].name;
            const guess = guesses[key] || 3;
            const actual = getScore(key);
            const diff = Math.abs(guess - actual);
            const isBigGap = diff >= 1.0;

            // Compute positions on scale 1-5 (span of 4)
            const guessPos = ((guess - 1) / 4) * 100;
            const actualPos = ((actual - 1) / 4) * 100;

            return (
              <div key={key} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{name}</span>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>Estimat: {guess.toFixed(1)}</span>
                    <span>Svar: {actual.toFixed(1)}</span>
                  </div>
                </div>

                {/* Double slider visual track */}
                <div className="relative h-6 flex items-center">
                  <div className="absolute left-0 right-0 h-1 bg-slate-200 rounded-full" />
                  
                  {/* Guess marker (Selvbilde) */}
                  <div 
                    className="absolute w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center -ml-2"
                    style={{ left: `${guessPos}%` }}
                    title={`Ditt selvbilde: ${guess}`}
                  >
                    <span className="absolute -top-5 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded">S</span>
                  </div>

                  {/* Actual marker (Svarmønster) */}
                  <div 
                    className="absolute w-4 h-4 bg-teal-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center -ml-2"
                    style={{ left: `${actualPos}%` }}
                    title={`Faktisk svarmønster: ${actual.toFixed(1)}`}
                  >
                    <span className="absolute -bottom-5 text-[9px] font-bold text-teal-700 bg-teal-50 px-1 rounded">F</span>
                  </div>
                </div>

                {/* Status description */}
                <div className="text-center pt-2">
                  {isBigGap ? (
                    <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-950 rounded-full border border-amber-200">
                      Sprik avdekket ({diff.toFixed(1)})
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-950 rounded-full">
                      Godt samsvar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Big Gap Warnings */}
        {bigGaps.length > 0 ? (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 sm:p-5 space-y-3">
            <h4 className="font-bold text-amber-950 text-sm sm:text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              Nøkkelobservasjon: Avvik mellom selvbilde og faktiske svar
            </h4>
            <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2">
              <p>
                Analysen avdekker et sprik på minst 1.0 poeng i dimensjonene: <strong className="text-amber-950">{bigGaps.map(g => g.name).join(', ')}</strong>.
              </p>
              <p className="bg-white/80 p-3.5 rounded-lg border border-amber-100 text-amber-950 font-medium">
                "Her ser du deg selv annerledes enn svarene dine antyder — det er nettopp slike sprik en ekte test og en erfaren intervjuer fanger opp."
              </p>
              <p>
                Dette er overhodet ikke en feil, men et verdifullt funn! Det betyr ofte at du har et idealisert bilde av hvordan du fungerer, eller at du undervurderer egne styrker i konkrete situasjoner. På intervjuet bør du være forberedt på å reflektere rundt dette. For eksempel: hvis du tror du er svært strukturert (selvbilde), men svarer at du tar ting på sparket under press (svarmønster).
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-950 text-xs sm:text-sm">Høy selvinnsikt!</h4>
              <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                Det er svært godt samsvar mellom hvordan du estimerer deg selv og svarene du oppgir på påstandene. Dette gir deg et solid fundament til intervjuet fordi din umiddelbare magefølelse stemmer overens med måten du tar valg på.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. KONSISTENS-SJEKK SOM REFLEKSJON OG TRENINGSVERDI */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5.5 h-5.5 text-teal-600" />
            2. Konsistens-sjekk (Svarsamsvar på like påstander)
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1">
            Profesjonelle personlighetstester har innebygde mekanismer for å kontrollere om du svarer konsekvent. Store avvik mellom påstander som måler det samme, flagges. Vi har målt deg på 5 par av beslektede påstander.
          </p>
        </div>

        {/* Summary Widget */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Resultat: {flaggedCount === 0 ? 'Høy samstemthet' : `${flaggedCount} av 5 par viser sprik`}
            </h4>
            <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
              {flaggedCount === 0 
                ? 'Flott! Du har svart svært konsekvent. Det viser at du har klare, avklarte mønstre og ikke forsøker å tilpasse svarene kunstig underveis.'
                : 'Sprik i svar er helt naturlig og reflekterer situasjonsbetingede forskjeller i atferden din. Se på dette som verdifull trening og forberedelse.'}
            </p>
          </div>

          <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${
            flaggedCount === 0 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
              : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            {flaggedCount === 0 ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
        </div>

        {/* List of 5 evaluated pairs */}
        <div className="space-y-4">
          {evaluatedPairs.map((pair, idx) => {
            const dimName = dimensionsData[pair.dimensjon].name;

            return (
              <div 
                key={idx} 
                className={`border rounded-xl overflow-hidden transition ${
                  pair.spriker 
                    ? 'border-amber-200 bg-amber-50/5 hover:border-amber-300' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                {/* Card Top Header */}
                <div className={`px-4 py-2.5 border-b flex justify-between items-center text-xs ${
                  pair.spriker 
                    ? 'bg-amber-50 border-amber-100 text-amber-900' 
                    : 'bg-slate-50 border-slate-100 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold bg-white border px-1.5 py-0.2 rounded text-[10px]">
                      Par {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {dimName}: <strong className="text-slate-900">{pair.label}</strong>
                    </span>
                  </div>
                  
                  {pair.spriker ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-950 rounded-full border border-amber-200/50 uppercase">
                      Treningsverdi / Sprik
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-950 rounded-full uppercase">
                      Konsekvent
                    </span>
                  )}
                </div>

                {/* Card Body comparisons */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Statement 1 */}
                    <div className="p-3 bg-white border border-slate-100 rounded-lg text-xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Påstand A</span>
                      <p className="text-slate-900 font-medium leading-relaxed mb-2">"{pair.st1.tekst}"</p>
                      <div className="text-slate-500 border-t border-slate-50 pt-1.5 flex justify-between">
                        <span>Svar:</span>
                        <strong className="text-slate-800 font-semibold">{getAnswerText(pair.rawAns1)}</strong>
                      </div>
                    </div>

                    {/* Statement 2 */}
                    <div className="p-3 bg-white border border-slate-100 rounded-lg text-xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Påstand B</span>
                      <p className="text-slate-900 font-medium leading-relaxed mb-2">"{pair.st2.tekst}"</p>
                      <div className="text-slate-500 border-t border-slate-50 pt-1.5 flex justify-between">
                        <span>Svar:</span>
                        <strong className="text-slate-800 font-semibold">{getAnswerText(pair.rawAns2)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Reframed Guidance */}
                  <div className="text-xs">
                    {pair.spriker ? (
                      <div className="bg-amber-100/30 p-3 rounded-lg border border-amber-200/60 space-y-1.5">
                        <p className="font-bold text-amber-950 flex items-center gap-1">
                          <HelpCircle className="w-4 h-4 text-amber-700" />
                          Hva betyr dette avviket? (Differanse på {pair.diff})
                        </p>
                        <p className="text-amber-900/90 leading-relaxed">
                          "Her svarte du sprikende på to like påstander. En ekte test vil fange dette. Tenk gjennom hvordan du forholder deg til denne forskjellen FØR du tar den ekte testen."
                        </p>
                        <p className="text-slate-600 leading-relaxed font-normal italic">
                          Det er helt naturlig at vi opplever situasjoner ulikt. For eksempel kan man være svært punktlig med tidsfrister, men foretrekke et rotete skrivebord. Forbered deg på å nyansere og forklare denne forskjellen med eksempler til intervjueren, i stedet for å forsøke å fremstå perfekt.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-emerald-50/30 p-3 rounded-lg border border-emerald-100 flex items-start gap-2 text-slate-600">
                        <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <p className="leading-relaxed">
                          Svarene dine her er helt samstemte. Dette indikerer en tydelig preferanse som er enkel for deg å formidle på intervjuet med klare, faste eksempler.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PER-DIMENSJON INTERVJUFORBEREDELSE (Mottiltak & Ærlige svar) */}
      <div id="prep-practice-panel" className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5.5 h-5.5 text-teal-600" />
            3. Intervjusimulator (Taktiske mottiltak &amp; Ærlige svar)
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1">
            Når en rekrutterer gransker profilen din, vil de rette søkelyset mot dine naturlige ytterpunkter eller "svakheter". Velg en dimensjon under for å se nøyaktig hvilke spørsmål du vil få basert på ditt svarnivå, og hvordan du svarer med høy integritet uten å late som du er noen andre.
          </p>
        </div>

        {/* Tab Selection for Dimensions inside Debrief */}
        <div className="flex flex-wrap gap-1.5 border-b pb-3 border-slate-100">
          {(Object.keys(dimensionsData) as DimensionKey[]).map((key) => {
            const name = dimensionsData[key].name;
            const score = getScore(key);
            const band = getBand(score);
            const isActive = activePrepDimKey === key;

            return (
              <button
                key={key}
                onClick={() => setActivePrepDimKey(key)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-950 border-slate-950 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span>{name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {band}
                </span>
              </button>
            );
          })}
        </div>

        {/* Prep Content Box */}
        {(() => {
          const score = getScore(activePrepDimKey);
          const band = getBand(score);
          const content = bandsData[activePrepDimKey][band];
          const desc = dimensionsData[activePrepDimKey].desc;

          return (
            <div className="grid md:grid-cols-12 gap-6 pt-2">
              
              {/* Left Side: Score card */}
              <div className="md:col-span-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    NIVÅ PÅ {dimensionsData[activePrepDimKey].name.toUpperCase()}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-slate-900">{band} preferanse</span>
                    <span className="text-xs text-slate-500">({score.toFixed(1)} av 5.0)</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Styrker i denne kategorien:</span>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {content.strengths}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Kontekstavhengige utfordringer:</span>
                  <p className="text-slate-500 leading-relaxed">
                    {content.pitfalls}
                  </p>
                  <p className="text-[11px] text-teal-800 italic font-medium leading-relaxed mt-1">
                    💡 Husk: Dette er ikke absolutte svakheter, men atferdstendenser som krever bevisst kompensasjon i visse situasjoner.
                  </p>
                </div>
              </div>

              {/* Right Side: Questions & Answers */}
              <div className="md:col-span-8 space-y-5">
                {/* Likely follow up questions */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <HelpIcon className="w-4 h-4 text-indigo-600" />
                    Sannsynlige oppfølgingsspørsmål fra rekrutterer
                  </h4>
                  <div className="space-y-2">
                    {content.interviewQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3 bg-indigo-50/20 border border-indigo-100/30 rounded-lg">
                        <p className="text-slate-900 text-xs sm:text-sm font-semibold leading-relaxed">
                          "{q}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authentic answers example */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Slik svarer du ærlig og troverdig (uten å pynte på det)
                  </h4>
                  <div className="space-y-2">
                    {content.honestAnswers.map((ans, aIdx) => (
                      <div key={aIdx} className="p-3.5 border-l-4 border-emerald-500 bg-emerald-50/15 rounded-r-lg text-xs sm:text-sm">
                        <span className="text-[9px] font-extrabold text-emerald-800 uppercase block mb-1">Ærlig svarmal {aIdx + 1}</span>
                        <p className="text-slate-700 italic leading-relaxed">
                          "{ans}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          );
        })()}
      </div>

      {/* 5. Bottom Navigation Shortcut */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Gå til dine STAR-intervjunotater</h4>
          <p className="text-slate-500 text-xs mt-0.5">
            Bruk notatboken til å skrive ned dine egne, personlige eksempler og historier basert på debriefen over.
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab('notes')}
          className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2 px-4 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>Åpne notatboken</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
