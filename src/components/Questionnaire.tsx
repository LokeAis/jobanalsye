import React, { useState, useEffect } from 'react';
import { statements, Statement, DimensionKey } from '../data/statements';
import { ChevronLeft, ChevronRight, HelpCircle, Clock, ShieldAlert, Timer, Compass, ArrowRight, Briefcase, Lock, Sparkles, AlertCircle } from 'lucide-react';

interface QuestionnaireProps {
  answers: Record<string, number>;
  onAnswer: (id: string, value: number) => void;
  onComplete: () => void;
}

export default function Questionnaire({ answers, onAnswer, onComplete }: QuestionnaireProps) {
  const [hasConfirmedContext, setHasConfirmedContext] = useState<boolean>(() => {
    return localStorage.getItem('bigfive_prep_confirmed_context') === 'true';
  });

  const [setupStep, setSetupStep] = useState<number>(1); // 1: Intro & Mode Selection, 2: Self-Insight Calibration, 3: Job Match Setup

  const [testMode, setTestMode] = useState<'standard' | 'realistic'>(() => {
    return (localStorage.getItem('bigfive_prep_mode') as 'standard' | 'realistic') || 'standard';
  });

  const [jobTitle, setJobTitle] = useState<string>(() => {
    return localStorage.getItem('bigfive_prep_job_title') || '';
  });

  const [jobDescription, setJobDescription] = useState<string>(() => {
    return localStorage.getItem('bigfive_prep_job_desc') || '';
  });

  const [guesses, setGuesses] = useState<Record<DimensionKey, number>>(() => {
    const saved = localStorage.getItem('bigfive_prep_guesses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      planmessighet: 3,
      emosjonell_stabilitet: 3,
      ekstroversjon: 3,
      omgjengelighet: 3,
      aapenhet: 3
    };
  });

  const [secondsElapsed, setSecondsElapsed] = useState<Record<string, number>>({});

  const [shuffledStatements] = useState<Statement[]>(() => {
    const savedOrder = localStorage.getItem('bigfive_prep_shuffled_ids');
    if (savedOrder) {
      try {
        const ids: string[] = JSON.parse(savedOrder);
        const statementMap = new Map(statements.map(s => [s.id, s]));
        const ordered = ids.map(id => statementMap.get(id)).filter(Boolean) as Statement[];
        if (ordered.length === statements.length) {
          return ordered;
        }
      } catch (e) {
        // Fallback
      }
    }
    const shuffled = [...statements].sort(() => Math.random() - 0.5);
    const ids = shuffled.map(s => s.id);
    localStorage.setItem('bigfive_prep_shuffled_ids', JSON.stringify(ids));
    return shuffled;
  });

  const [currentPage, setCurrentPage] = useState<number>(0);
  const itemsPerPage = 10;

  // Reacting timer in Realistic Mode
  useEffect(() => {
    if (testMode !== 'realistic' || !hasConfirmedContext) return;
    
    const interval = setInterval(() => {
      setSecondsElapsed(prev => {
        const next = { ...prev };
        currentPageStatements.forEach(st => {
          if (answers[st.id] === undefined) {
            next[st.id] = (next[st.id] || 0) + 1;
          }
        });
        return next;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [testMode, hasConfirmedContext, currentPage, answers]);

  const answeredCount = shuffledStatements.filter(s => answers[s.id] !== undefined).length;
  const progressPercent = Math.round((answeredCount / statements.length) * 100);

  // Get items for current page
  const pageStartIndex = currentPage * itemsPerPage;
  const currentPageStatements = shuffledStatements.slice(pageStartIndex, pageStartIndex + itemsPerPage);
  const totalPages = Math.ceil(statements.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentPage > 0 && testMode !== 'realistic') {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSelect = (pageIdx: number) => {
    if (testMode !== 'realistic') {
      setCurrentPage(pageIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation for the Likert radiogroup (WAI-ARIA radio pattern:
  // arrows move and select, Home/End jump to ends).
  const handleLikertKey = (e: React.KeyboardEvent, statementId: string, currentAnswer: number | undefined) => {
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = currentAnswer ? Math.min(5, currentAnswer + 1) : 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = currentAnswer ? Math.max(1, currentAnswer - 1) : 5;
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = 5;
    else return;
    e.preventDefault();
    onAnswer(statementId, next);
    requestAnimationFrame(() => document.getElementById(`opt-${statementId}-${next}`)?.focus());
  };

  const handleGuessChange = (key: DimensionKey, value: number) => {
    setGuesses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGuessKey = (e: React.KeyboardEvent, key: DimensionKey, current: number) => {
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(5, current + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(1, current - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = 5;
    else return;
    e.preventDefault();
    handleGuessChange(key, next);
    requestAnimationFrame(() => document.getElementById(`guess-${key}-${next}`)?.focus());
  };

  const handleConfirmOnboarding = () => {
    localStorage.setItem('bigfive_prep_mode', testMode);
    localStorage.setItem('bigfive_prep_guesses', JSON.stringify(guesses));
    localStorage.setItem('bigfive_prep_job_title', jobTitle.trim());
    localStorage.setItem('bigfive_prep_job_desc', jobDescription.trim());
    localStorage.setItem('bigfive_prep_confirmed_context', 'true');
    setHasConfirmedContext(true);
  };

  const handleSkipJobOnboarding = () => {
    setJobTitle('');
    setJobDescription('');
    localStorage.removeItem('bigfive_prep_job_title');
    localStorage.removeItem('bigfive_prep_job_desc');
    localStorage.setItem('bigfive_prep_mode', testMode);
    localStorage.setItem('bigfive_prep_guesses', JSON.stringify(guesses));
    localStorage.setItem('bigfive_prep_confirmed_context', 'true');
    setHasConfirmedContext(true);
  };

  const optionLabels = [
    { value: 1, label: 'Helt uenig' },
    { value: 2, label: 'Litt uenig' },
    { value: 3, label: 'Verken eller' },
    { value: 4, label: 'Litt enig' },
    { value: 5, label: 'Helt enig' }
  ];

  const dimensionsList: { key: DimensionKey; name: string; desc: string }[] = [
    { key: 'planmessighet', name: 'Planmessighet', desc: 'Struktur, orden, detaljer, pålitelighet og selvdisiplin på arbeidsplassen.' },
    { key: 'emosjonell_stabilitet', name: 'Emosjonell stabilitet', desc: 'Robusthet under press, stresstoleranse og evne til å holde hodet kaldt.' },
    { key: 'ekstroversjon', name: 'Ekstroversjon', desc: 'Hvor du henter sosial energi, din grad av utadvendthet, taleinitiativ og selskapslyst.' },
    { key: 'omgjengelighet', name: 'Omgjengelighet', desc: 'Innstilling til samarbeid, tillit til kolleger, empati og ønske om harmoni.' },
    { key: 'aapenhet', name: 'Åpenhet for erfaring', desc: 'Intellektuell nysgjerrighet, kreativitet, fantasi og vilje til endring og nye metoder.' }
  ];

  // 1. Splash Screen: Work Context & Onboarding Wizard
  if (!hasConfirmedContext) {
    return (
      <div id="splash-context" className="max-w-2xl mx-auto py-6 px-4">
        {/* Progress indicators for setup */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className={`h-2 rounded-full transition-all duration-300 ${setupStep === 1 ? 'w-8 bg-teal-700' : 'w-2 bg-slate-200'}`} />
          <div className={`h-2 rounded-full transition-all duration-300 ${setupStep === 2 ? 'w-8 bg-indigo-700' : 'w-2 bg-slate-200'}`} />
          <div className={`h-2 rounded-full transition-all duration-300 ${setupStep === 3 ? 'w-8 bg-teal-700' : 'w-2 bg-slate-200'}`} />
        </div>

        {setupStep === 1 ? (
          /* STEP 1: Intro, Mode Selection & Disclaimer */
          <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mb-4 mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Generalprøve før rekrutteringstest
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Velkommen til generalprøven. Dette verktøyet ruster deg til å ta ekte tester som OPQ32, MAP og Aon/cut-e.
              </p>
            </div>

            {/* Clear, Visible Disclaimer */}
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-lg text-xs sm:text-sm text-amber-900 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Viktig ansvarsfraskrivelse &amp; formål
              </div>
              <p>
                Dette er et <strong>øvingsverktøy for økt selvinnsikt og forberedelse</strong>, ikke en offisiell rekrutteringstest. Hensikten er ikke å lære deg å manipulere eller pynte på resultatene – ekte tester har avanserte fasade- og inkonsistens-sjekker som vil fange dette opp. Verdien ligger i ærlig forberedelse og trygghet under press.
              </p>
            </div>

            {/* Work Context reminder */}
            <div className="bg-teal-50/40 border-l-4 border-teal-600 p-4 rounded-r-lg text-teal-950 text-sm">
              <strong>💡 Gyllen regel:</strong> Svar basert på hvordan du faktisk opptrer i <strong>arbeidshverdagen</strong>. Ikke tenk på hvordan du er privat, og svar så ærlig og konsistent som mulig.
            </div>

            {/* Mode Selection Grid */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Velg testmodus:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Standard Mode */}
                <button
                  type="button"
                  onClick={() => setTestMode('standard')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    testMode === 'standard'
                      ? 'border-teal-700 bg-teal-50/10 ring-1 ring-teal-700'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">Standard modus</span>
                      <input 
                        type="radio" 
                        checked={testMode === 'standard'} 
                        onChange={() => {}} 
                        className="text-teal-700 focus:ring-teal-500" 
                      />
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Ta testen i ditt eget tempo. Du kan bla frem og tilbake mellom sidene og endre svar underveis.
                    </p>
                  </div>
                </button>

                {/* Realistic Mode */}
                <button
                  type="button"
                  onClick={() => setTestMode('realistic')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    testMode === 'realistic'
                      ? 'border-teal-700 bg-teal-50/10 ring-1 ring-teal-700'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                        Realistisk modus
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">ANBEFALT</span>
                      </span>
                      <input 
                        type="radio" 
                        checked={testMode === 'realistic'} 
                        onChange={() => {}} 
                        className="text-teal-700 focus:ring-teal-500" 
                      />
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Trener deg på presset i en ekte test. Inneholder en synlig tidsmåler per spørreskjema for å hindre grubling, og deaktiverer tilbakeknappen.
                    </p>
                  </div>
                </button>

              </div>
            </div>

            <button
              id="btn-next-setup"
              type="button"
              onClick={() => setSetupStep(2)}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-6 rounded-lg transition shadow-sm hover:shadow-md cursor-pointer text-center flex items-center justify-center gap-2"
            >
              Neste: Selvinnsikt-kalibrering
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* STEP 2: Selvinnsikt-kalibrering */
          <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 mb-4 mx-auto">
                <Timer className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Trinn 2: Selvinnsikt-kalibrering
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Før generalprøven starter, ber vi deg gjette på en skala fra <strong>1 til 5</strong> hvor du tror du ligger på hver av de fem dimensjonene på jobb. Etterpå sammenligner vi dette med ditt faktiske svarmønster for å avsløre eventuelle sprik i selvbilde.
              </p>
            </div>

            <div className="space-y-6">
              {dimensionsList.map((dim) => {
                const val = guesses[dim.key];
                return (
                  <div key={dim.key} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base flex justify-between items-center">
                        <span>{dim.name}</span>
                        <span className="text-indigo-800 bg-indigo-50 font-bold px-2 py-0.5 rounded-md text-xs sm:text-sm">
                          Ditt estimat: {val} / 5
                        </span>
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{dim.desc}</p>
                    </div>

                    {/* Button Group for 1-5 selection */}
                    <div
                      role="radiogroup"
                      aria-label={`Ditt estimat for ${dim.name}`}
                      onKeyDown={(e) => handleGuessKey(e, dim.key, val)}
                      className="grid grid-cols-5 gap-2"
                    >
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = val === num;
                        const label =
                          num === 1 ? 'Meget lav' : num === 2 ? 'Lav' : num === 3 ? 'Gjennomsnitt' : num === 4 ? 'Høy' : 'Meget høy';
                        return (
                          <button
                            key={num}
                            id={`guess-${dim.key}-${num}`}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`${num} – ${label}`}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => handleGuessChange(dim.key, num)}
                            className={`py-2 px-1 rounded-lg border text-center text-xs sm:text-sm font-semibold transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                              isSelected
                                ? 'bg-indigo-700 border-indigo-700 text-white shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{num}</span>
                            <span className="hidden xs:block text-[9px] font-normal opacity-90 mt-0.5">
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSetupStep(1)}
                className="bg-white border border-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5 text-sm sm:text-base"
              >
                Tilbake
              </button>
              <button
                id="btn-confirm-context"
                type="button"
                onClick={() => setSetupStep(3)}
                className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-6 rounded-lg transition shadow-sm hover:shadow-md cursor-pointer text-center flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Neste: Stillingsinformasjon (valgfritt)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {setupStep === 3 && (
          /* STEP 3: Job Context Setup */
          <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mb-4 mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Trinn 3: Stillingsmatch (valgfritt)
              </h2>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Knytt testen til en konkret stilling du forbereder deg til. Vi skreddersyr da dine personlige intervjutips og genererer en spisset debriefingrapport når testen er ferdig.
              </p>
            </div>

            {/* Lock / Privacy Warning */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800 block mb-0.5">Låst vekk under testen:</strong>
                Informasjonen du fyller inn her blir fullstendig skjult mens du besvarer spørsmålene, slik at du ikke blir fristet til å svare strategisk eller vinkle svarene dine.
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Stillingstittel du søker på (valgfri)
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="F.eks. Prosjektleder, Kundekonsulent, Utvikler, Sykepleier..."
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Stillingsbeskrivelse / Annonsetekst (valgfri, men anbefalt)
                </label>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Lim inn hele stillingsannonsen, arbeidsoppgavene, eller kravene til rollen her..."
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/20"
                />
                {jobDescription.trim().length > 0 && jobDescription.trim().length < 150 && (
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg flex items-start gap-2 text-amber-900 text-xs sm:text-sm mt-2 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-amber-950">Svak tekstkvalitet</span>
                      <span>Stillingsbeskrivelsen er for tynn til en god analyse — lim inn mer.</span>
                    </div>
                  </div>
                )}
                {jobDescription.trim().length >= 150 && jobDescription.trim().length <= 400 && (
                  <div className="bg-yellow-50/80 border border-yellow-200 p-3.5 rounded-lg flex items-start gap-2 text-yellow-900 text-xs sm:text-sm mt-2 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-yellow-950">Begrenset beskrivelse</span>
                      <span>Kort beskrivelse — analysen blir grovere. Mer tekst gir bedre treff.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSetupStep(2)}
                className="bg-white border border-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5 text-sm"
              >
                Tilbake
              </button>
              
              <button
                type="button"
                onClick={handleSkipJobOnboarding}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition cursor-pointer text-sm text-center"
              >
                Hopp over og start testen
              </button>

              <button
                type="button"
                onClick={handleConfirmOnboarding}
                disabled={!jobTitle.trim()}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition shadow-sm hover:shadow-md cursor-pointer text-center text-sm flex items-center justify-center gap-2 ${
                  jobTitle.trim()
                    ? 'bg-teal-700 hover:bg-teal-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Start med stillingsmatch
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="questionnaire-view" className="max-w-3xl mx-auto py-6 px-4">
      {/* Progress Bar & Header */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
              <span>Din Generalprøve</span>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${testMode === 'realistic' ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'}`}>
                {testMode === 'realistic' ? 'Realistisk modus (Tidtakning på)' : 'Standard modus'}
              </span>
            </h3>
            <p className="text-slate-500 text-xs">
              Generalprøven lagres automatisk per påstand. {testMode === 'realistic' ? 'Svar kan ikke endres etter at du bytter side.' : 'Du kan avbryte og fortsette når du vil.'}
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 border border-teal-100 rounded-full shrink-0">
            Besvart {answeredCount} av {statements.length} ({progressPercent}%)
          </span>
        </div>
        
        {/* Actual Progress Line */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Warning/Guide Reminder */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 px-4 mb-6 text-xs text-slate-600 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Svar basert på hvordan du vanligvis opptrer i <strong>arbeidssituasjoner</strong>.</span>
        </div>
        {testMode === 'realistic' && (
          <span className="text-rose-700 font-semibold animate-pulse flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Gruble-indikator aktiv
          </span>
        )}
      </div>

      {/* Statements List */}
      <div className="space-y-6">
        {currentPageStatements.map((st, index) => {
          const globalIndex = pageStartIndex + index + 1;
          const currentAnswer = answers[st.id];
          const timeOnQuestion = secondsElapsed[st.id] || 0;

          return (
            <div 
              key={st.id} 
              id={`question-card-${st.id}`}
              className={`bg-white border rounded-xl p-5 sm:p-6 transition duration-150 relative overflow-hidden ${
                currentAnswer !== undefined 
                  ? 'border-slate-100 shadow-xs' 
                  : 'border-slate-200/80 shadow-xs border-l-4 border-l-slate-400'
              }`}
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-slate-400 shrink-0 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mt-0.5">
                    {globalIndex}
                  </span>
                  <p id={`q-label-${st.id}`} className="text-slate-900 font-medium text-sm sm:text-base leading-relaxed">
                    {st.tekst}
                  </p>
                </div>

                {/* Realistic Mode Timer Badge */}
                {testMode === 'realistic' && (
                  <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition ${
                    currentAnswer !== undefined
                      ? 'bg-slate-100 text-slate-500'
                      : timeOnQuestion > 12
                      ? 'bg-rose-50 text-rose-700 animate-pulse'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    <Timer className="w-3.5 h-3.5" />
                    <span>
                      {currentAnswer !== undefined ? `Svart på ${timeOnQuestion}s` : `Tid: ${timeOnQuestion}s`}
                    </span>
                  </div>
                )}
              </div>

              {/* Likert Scale Container */}
              <div
                role="radiogroup"
                aria-labelledby={`q-label-${st.id}`}
                onKeyDown={(e) => handleLikertKey(e, st.id, currentAnswer)}
                className="grid grid-cols-5 gap-1.5 sm:gap-4 mt-2"
              >
                {optionLabels.map((opt) => {
                  const isSelected = currentAnswer === opt.value;
                  // Roving tabindex: the checked option is the single tab stop;
                  // if nothing is selected yet, the first option is reachable.
                  const tabbable = currentAnswer !== undefined ? isSelected : opt.value === 1;
                  return (
                    <button
                      key={opt.value}
                      id={`opt-${st.id}-${opt.value}`}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${opt.value} – ${opt.label}`}
                      tabIndex={tabbable ? 0 : -1}
                      onClick={() => onAnswer(st.id, opt.value)}
                      className={`flex flex-col items-center justify-between py-2.5 px-1 rounded-lg border text-center transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ${
                        isSelected
                          ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-sm font-bold sm:text-base">{opt.value}</span>
                      <span className="text-[10px] sm:text-[11px] leading-tight mt-1 hidden xs:block font-medium opacity-90">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          {testMode !== 'realistic' && (
            <button
              id="btn-page-back"
              onClick={handleBack}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 transition text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Forrige side
            </button>
          )}
          
          <button
            id="btn-page-next"
            onClick={handleNext}
            disabled={currentPageStatements.some(s => answers[s.id] === undefined)}
            className="px-4 py-2 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 transition text-sm"
          >
            {currentPage === totalPages - 1 ? 'Fullfør og gå til debriefing' : 'Neste side'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 order-1 sm:order-2">
          {testMode === 'realistic' ? (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border">
              Side {currentPage + 1} av {totalPages} (Bakover-navigasjon deaktivert i realistisk modus)
            </span>
          ) : (
            Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageSelect(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition border cursor-pointer ${
                  currentPage === idx
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {idx + 1}
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Complete warning if user misses some answers */}
      {currentPageStatements.some(s => answers[s.id] === undefined) && (
        <p className="text-center text-xs text-slate-500 mt-4 italic">
          * Du må besvare alle 10 påstandene på denne siden før du kan gå videre i generalprøven.
        </p>
      )}
    </div>
  );
}
