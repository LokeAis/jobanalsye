import React, { useState, useEffect, useRef } from 'react';
import { statements, DimensionKey, dimensionsData, resolveDimensionKey } from './data/statements';
import { usePremium } from './premium/PremiumContext';
import { useAuth } from './auth/AuthContext';
import { useFeedback } from './ui/Feedback';
import DisclaimerBanner from './components/DisclaimerBanner';
import LandingPage from './components/LandingPage';
import BigFiveOverview from './components/BigFiveOverview';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';
import ConsistencyReview from './components/ConsistencyReview';
import InterviewPrep from './components/InterviewPrep';
import NotesSection from './components/NotesSection';
import JobAnalysis from './components/JobAnalysis';
import InterviewSimulator from './components/InterviewSimulator';

import { 
  Compass, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  BookMarked, 
  ShieldAlert, 
  Trash2, 
  Home,
  Check,
  Sparkles,
  MessageSquare,
  Ticket,
  LogIn,
  LogOut
} from 'lucide-react';

type TabType = 'home' | 'theory' | 'questionnaire' | 'results' | 'consistency' | 'prep' | 'jobAnalysis' | 'interview' | 'notes' | 'privacy';

// All localStorage keys the app owns — used for reset, export and import.
const STORAGE_KEYS = [
  'bigfive_prep_answers',
  'bigfive_prep_notes',
  'bigfive_prep_confirmed_context',
  'bigfive_prep_shuffled_ids',
  'bigfive_prep_job_title',
  'bigfive_prep_job_desc',
  'bigfive_prep_job_analysis',
  'bigfive_prep_job_analyses',
  'bigfive_prep_guesses',
  'bigfive_prep_mode',
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { isPremium, unlock, lock } = usePremium();
  const { configured, loading, user, credits, signIn, signOut } = useAuth();
  const { toast, confirm } = useFeedback();
  
  // 1. Load state from localStorage on init
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('bigfive_prep_answers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [notes, setNotes] = useState<Record<string, { workExample: string; interviewStrength: string; awareness: string }>>(() => {
    const saved = localStorage.getItem('bigfive_prep_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // 2. Persistent saves on update
  const handleAnswer = (id: string, value: number) => {
    const newAnswers = { ...answers, [id]: value };
    setAnswers(newAnswers);
    localStorage.setItem('bigfive_prep_answers', JSON.stringify(newAnswers));
  };

  const handleSaveNote = (
    dimKey: DimensionKey, 
    field: 'workExample' | 'interviewStrength' | 'awareness', 
    value: string
  ) => {
    const currentDimNotes = notes[dimKey] || { workExample: '', interviewStrength: '', awareness: '' };
    const updatedNotes = {
      ...notes,
      [dimKey]: {
        ...currentDimNotes,
        [field]: value
      }
    };
    setNotes(updatedNotes);
    localStorage.setItem('bigfive_prep_notes', JSON.stringify(updatedNotes));
  };

  // 3. Clear data and reset
  const handleResetAllData = () => {
    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    setAnswers({});
    setNotes({});
    setActiveTab('home');
    setShowResetConfirm(false);
  };

  // 3b. Export all local data as a JSON backup file.
  const handleExportData = () => {
    const data: Record<string, string> = {};
    STORAGE_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    });

    const backup = {
      app: 'big-five-forberedelse',
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `big_five_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3c. Import a JSON backup and restore it (then reload so all views re-init).
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-importing the same file later
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = parsed?.data;
        if (!data || typeof data !== 'object') {
          throw new Error('Mangler "data"-felt');
        }

        const allowed = new Set<string>(STORAGE_KEYS);
        const importableKeys = Object.keys(data).filter(
          (k) => allowed.has(k) && typeof data[k] === 'string'
        );

        if (importableKeys.length === 0) {
          throw new Error('Ingen gjenkjennelige data');
        }

        const ok = await confirm({
          title: 'Gjenopprette sikkerhetskopi?',
          message:
            'Dette overskriver alle nåværende svar og notater i denne nettleseren med innholdet fra sikkerhetskopien.',
          confirmLabel: 'Gjenopprett',
          danger: true,
        });
        if (!ok) return;

        // Clear current data first, then write the backup's keys.
        STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
        importableKeys.forEach((key) => localStorage.setItem(key, data[key]));

        toast('Sikkerhetskopien er gjenopprettet. Laster siden på nytt …', 'success');
        setTimeout(() => window.location.reload(), 700);
      } catch (e) {
        console.error('Import failed:', e);
        toast('Kunne ikke lese filen. Sjekk at det er en gyldig Big Five-sikkerhetskopi (.json).', 'error');
      }
    };
    reader.readAsText(file);
  };

  const answeredCount = statements.filter(s => answers[s.id] !== undefined).length;
  const isQuestionnaireComplete = answeredCount === statements.length;

  // Tab navigation helper
  const navigateToTab = (tabId: string) => {
    setActiveTab(tabId as TabType);
    window.scrollTo({ top: 0 });
  };

  // Tab definitions (data-driven so the tablist stays consistent and accessible).
  const lockBadge = !isQuestionnaireComplete ? (
    <span className="text-[10px] bg-slate-200 text-slate-500 px-1 rounded-sm">Låst</span>
  ) : null;

  const tabs: {
    key: TabType;
    id: string;
    label: string;
    shortLabel?: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
    activeClass?: string;
  }[] = [
    { key: 'home', id: 'tab-home', label: 'Start', icon: <Home className="w-4 h-4 text-slate-400" /> },
    { key: 'theory', id: 'tab-theory', label: 'Big Five-oversikt', shortLabel: 'Oversikt', icon: <BookOpen className="w-4 h-4 text-slate-400" /> },
    {
      key: 'questionnaire',
      id: 'tab-questionnaire',
      label: 'Spørreskjema',
      shortLabel: 'Test',
      icon: <ClipboardList className="w-4 h-4 text-slate-400" />,
      badge: answeredCount > 0 ? (
        <span className="ml-1 bg-teal-100 text-teal-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {answeredCount}/60
        </span>
      ) : null,
    },
    {
      key: 'consistency',
      id: 'tab-consistency',
      label: 'Tentamensrapport (Debrief)',
      shortLabel: 'Debrief',
      icon: <ShieldCheck className="w-4 h-4 text-slate-400" />,
      activeClass: 'bg-teal-700 text-white border border-teal-700 shadow-xs',
      badge: lockBadge,
    },
    {
      key: 'results',
      id: 'tab-results',
      label: 'Detaljert Profil',
      shortLabel: 'Profil',
      icon: <FileText className="w-4 h-4 text-slate-400" />,
      badge: lockBadge,
    },
    {
      key: 'prep',
      id: 'tab-prep',
      label: 'Intervjuforberedelse',
      shortLabel: 'Forberedelse',
      icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
      badge: lockBadge,
    },
    {
      key: 'jobAnalysis',
      id: 'tab-job-analysis',
      label: 'AI Jobbanalyse',
      shortLabel: 'Jobbanalyse',
      icon: <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />,
      badge: <span className="text-[10px] bg-teal-100 text-teal-800 px-1 rounded-sm font-bold">AI</span>,
    },
    {
      key: 'interview',
      id: 'tab-interview',
      label: 'Intervju-simulator',
      shortLabel: 'Simulator',
      icon: <MessageSquare className="w-4 h-4 text-teal-600" />,
      badge: <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded-sm font-bold">PRO</span>,
    },
    { key: 'notes', id: 'tab-notes', label: 'Mine Notater', shortLabel: 'Notater', icon: <BookMarked className="w-4 h-4 text-slate-400" /> },
    { key: 'privacy', id: 'tab-privacy', label: 'Personvern', icon: <ShieldCheck className="w-4 h-4 text-teal-600" /> },
  ];

  const activeTabId = tabs.find((t) => t.key === activeTab)?.id;

  // Roving keyboard navigation for the tablist (WAI-ARIA automatic activation).
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const currentIndex = tabs.findIndex((t) => t.key === activeTab);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;
    else return;

    e.preventDefault();
    const next = tabs[nextIndex];
    navigateToTab(next.key);
    requestAnimationFrame(() => document.getElementById(next.id)?.focus());
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-800 flex flex-col antialiased">
      
      {/* Upper Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo / Brand */}
            <button 
              onClick={() => navigateToTab('home')}
              className="flex items-center gap-2.5 text-slate-900 hover:text-slate-700 transition cursor-pointer text-left"
            >
              <div className="w-9 h-9 bg-teal-700 rounded-lg flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base leading-none block">Big Five Forberedelse</span>
                <span className="text-[10px] text-slate-500 font-medium">Refleksjonsverktøy for rekruttering</span>
              </div>
            </button>

            {/* Answer progress + auth/credits */}
            <div className="flex items-center gap-2 sm:gap-3">
              {answeredCount > 0 && (
                <button
                  onClick={() => navigateToTab('questionnaire')}
                  className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  <span>Svart: {answeredCount} / 60</span>
                </button>
              )}

              {configured && !loading && (
                user ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg"
                      title="Dine AI-klipp"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      {credits ?? '–'} klipp
                    </span>
                    <button
                      onClick={() => signOut()}
                      title={user.email || 'Logg ut'}
                      className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logg ut
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Logg inn
                  </button>
                )
              )}
            </div>

          </div>
        </div>

        {/* Tab Selection Row (Responsive horizontal scroll) */}
        <div className="bg-slate-50 border-t border-slate-200/50">
          <div className="relative max-w-6xl mx-auto">
            {/* Edge fades hint that the strip scrolls horizontally on small screens */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-50 to-transparent z-10 sm:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-50 to-transparent z-10 sm:hidden" />
            <div className="px-2 overflow-x-auto scrollbar-none">
            <nav
              role="tablist"
              aria-label="Seksjoner"
              onKeyDown={handleTabKeyDown}
              className="flex space-x-1 py-1.5 min-w-max"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const activeStyles =
                  tab.activeClass ?? 'bg-white text-slate-900 border border-slate-200/60 shadow-xs';
                return (
                  <button
                    key={tab.key}
                    id={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="main-tabpanel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => navigateToTab(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      isActive ? activeStyles : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {tab.icon}
                    {tab.shortLabel ? (
                      <>
                        <span className="sm:hidden">{tab.shortLabel}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                      </>
                    ) : (
                      <span>{tab.label}</span>
                    )}
                    {tab.badge}
                  </button>
                );
              })}
            </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mandatory Disclaimer visible on all pages */}
      <div className="px-4 print:hidden shrink-0">
        <DisclaimerBanner />
      </div>

      {/* Main Content Area */}
      <main
        id="main-tabpanel"
        role="tabpanel"
        aria-labelledby={activeTabId}
        tabIndex={0}
        className="flex-1 pb-16 print:hidden"
      >
        
        {activeTab === 'home' && (
          <LandingPage 
            onStart={() => navigateToTab('questionnaire')}
            onViewOverview={() => navigateToTab('theory')}
            completedCount={answeredCount}
          />
        )}

        {activeTab === 'theory' && (
          <BigFiveOverview />
        )}

        {activeTab === 'questionnaire' && (
          <Questionnaire 
            answers={answers}
            onAnswer={handleAnswer}
            onComplete={() => navigateToTab('results')}
          />
        )}

        {activeTab === 'results' && (
          <Results 
            answers={answers}
            onNavigateToTab={navigateToTab}
          />
        )}

        {activeTab === 'consistency' && (
          <ConsistencyReview 
            answers={answers}
            onNavigateToTab={navigateToTab}
          />
        )}

        {activeTab === 'prep' && (
          <InterviewPrep 
            answers={answers}
            onNavigateToTab={navigateToTab}
          />
        )}

        {activeTab === 'jobAnalysis' && (
          <JobAnalysis 
            answers={answers}
            notes={notes}
            onSaveNote={handleSaveNote}
            onNavigateToTab={navigateToTab}
          />
        )}

        {activeTab === 'interview' && (
          <InterviewSimulator
            answers={answers}
            onNavigateToTab={navigateToTab}
          />
        )}

        {activeTab === 'notes' && (
          <NotesSection
            notes={notes}
            onSaveNote={handleSaveNote}
            answers={answers}
          />
        )}

        {activeTab === 'privacy' && (
          <div id="privacy-view" className="max-w-2xl mx-auto py-8 px-4 print:hidden">
            <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-xs">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mb-6 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-2">
                Slik håndteres dine data
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm text-center mb-6 max-w-md mx-auto">
                Testen og notatene dine forblir lokalt på din enhet. Den valgfrie AI-jobbanalysen sender data til Google Gemini for å generere rapporten.
              </p>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed mb-8 border-t border-slate-100 pt-6">
                <p>
                  • <strong>Ingen registrering:</strong> Du trenger ikke registrere deg eller logge inn for å bruke appen.
                </p>
                <p>
                  • <strong>Test og notater er 100 % lokale:</strong> Svarene på spørreskjemaet, profilberegningen og notatene dine lagres kun i din egen nettlesers lokale lager (localStorage). Disse sendes aldri til noen server, og du kan lukke fanen og fortsette senere uten å miste framdriften.
                </p>
                <p>
                  • <strong>AI-jobbanalysen (valgfri) bruker en ekstern tjeneste:</strong> Hvis du velger å kjøre AI Jobbanalyse, sendes stillingstittelen, stillingsbeskrivelsen du limer inn, og dine beregnede Big Five-skårer til vår server og videre til <strong>Google Gemini</strong> for å generere rapporten. Ikke lim inn sensitive personopplysninger i stillingsfeltene. Denne delen er helt frivillig — resten av appen fungerer fullt ut uten den.
                </p>
              </div>

              {/* Premium status / dev toggle */}
              <div className="border-t border-slate-150 pt-6 mb-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Premium-tilgang
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                  Premium låser opp flere lagrede jobbanalyser, intervju-simulatoren og PDF uten vannmerke.
                  {' '}
                  <span className="italic">Foreløpig er dette en gratis utviklertilgang uten betaling.</span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                      isPremium
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {isPremium ? <Check className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {isPremium ? 'Premium aktiv' : 'Gratisversjon'}
                  </span>
                  {isPremium ? (
                    <button
                      onClick={lock}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm transition cursor-pointer"
                    >
                      Slå av premium
                    </button>
                  ) : (
                    <button
                      onClick={unlock}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm transition cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Lås opp premium (gratis)
                    </button>
                  )}
                </div>
              </div>

              {/* Backup / Restore Section */}
              <div className="border-t border-slate-150 pt-6 mb-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">Sikkerhetskopi av dine data</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                  Siden alt lagres lokalt, forsvinner svar og notater hvis du tømmer nettleseren eller bytter enhet. Last ned en sikkerhetskopi for å ta vare på dem, eller gjenopprett en tidligere kopi.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportData}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-semibold px-4 py-2.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Last ned sikkerhetskopi
                  </button>
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-semibold px-4 py-2.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    Gjenopprett fra fil
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Reset Section */}
              <div className="border-t border-slate-150 pt-6">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">Slett dine lagrede data</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                  Ønsker du å fjerne alle svar og notater fra nettleseren din (f.eks. hvis du bruker en delt datamaskin)? Klikk på knappen nedenfor. Denne handlingen kan ikke angres.
                </p>

                {showResetConfirm ? (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg space-y-3">
                    <p className="text-rose-950 font-semibold text-xs sm:text-sm flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      Er du helt sikker på at du vil slette alt?
                    </p>
                    <p className="text-rose-900 text-xs">
                      Dette vil fjerne alle dine 60 svar på spørreskjemaet og alle dine personlige notater permanent.
                    </p>
                    <div className="flex gap-2">
                      <button
                        id="btn-confirm-delete"
                        onClick={handleResetAllData}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-lg text-xs sm:text-sm cursor-pointer transition"
                      >
                        Ja, slett alt permanent
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="bg-white border border-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-slate-50 transition"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id="btn-trigger-delete"
                    onClick={() => setShowResetConfirm(true)}
                    className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 font-semibold px-4 py-2.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Slett mine svar og notater
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer for print & branding */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto shrink-0 print:hidden">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 Big Five Forberedelse — Test og notater lagres lokalt. AI-jobbanalysen (valgfri) bruker Google Gemini.</p>
        </div>
      </footer>

      {/* Print Specific Stylings: will print neat clean notes pages or briefing pages without UI headers */}
      {isQuestionnaireComplete && (
        <div id="briefing-print-section" className="hidden print:block p-8 max-w-4xl mx-auto bg-white">
          {(() => {
            const saved = localStorage.getItem('bigfive_prep_job_analysis');
            const jobTitle = localStorage.getItem('bigfive_prep_job_title') || '';
            if (saved) {
              try {
                const analysis = JSON.parse(saved);
                return (
                  /* UNIFIED INTERVJU-BRIEFING PRINT FORMAT (Task 5) */
                  <div className="space-y-8">
                    <div className="border-b-2 border-slate-900 pb-4 mb-6">
                      <span className="text-xs uppercase font-mono text-slate-500 block mb-1">
                        KANDIDAT-BRIEFING — KUN TIL PERSONLIG BRUK UNDER FORBEREDELSE
                      </span>
                      <h1 className="text-3xl font-black text-slate-900">Briefing til Intervjudagen</h1>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600"><span className="font-semibold text-slate-800">Søkt stilling:</span> {jobTitle}</p>
                          <p className="text-slate-600"><span className="font-semibold text-slate-800">Dato:</span> {new Date().toLocaleDateString('no-NO')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-600"><span className="font-semibold text-slate-800">Match-bånd:</span> <span className="font-bold text-teal-800">{analysis.matchBand} Match</span></p>
                          <p className="text-slate-500 text-xs">Vurdert via Big Five Tentamen</p>
                        </div>
                      </div>
                    </div>

                    {/* Rolleanalyse og match-begrunnelse */}
                    <div className="space-y-3 break-inside-avoid">
                      <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b pb-1">1. Overordnet Match-Analyse</h2>
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {analysis.matchAnalysis}
                      </p>
                    </div>

                    {/* Implisitte Jobbkrav & Profil Side-ved-side */}
                    <div className="space-y-4 break-inside-avoid">
                      <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b pb-1">2. Rolleanalyse &amp; Personlighetsprofil (Side-ved-side)</h2>
                      <div className="grid gap-3">
                        {analysis.impliedTraits?.map((t: any, idx: number) => {
                          let userBand = '';
                          let userScoreText = '';

                          const matchedKey = resolveDimensionKey(t.trait);

                          if (matchedKey) {
                            const dimStatements = statements.filter(s => s.dimensjon === matchedKey);
                            let sum = 0;
                            dimStatements.forEach(s => {
                              const ans = answers[s.id] || 3;
                              const actualVal = s.keyed === 'negativ' ? (6 - ans) : ans;
                              sum += actualVal;
                            });
                            const score = sum / dimStatements.length;
                            
                            const getBandLocal = (s: number) => {
                              if (s <= 2.6) return 'Lav';
                              if (s >= 3.7) return 'Høy';
                              return 'Moderat';
                            };
                            userBand = getBandLocal(score);
                            userScoreText = `${userBand} tendens (${score.toFixed(1)}/5)`;
                          }

                          return (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-4 text-xs break-inside-avoid">
                              <div>
                                <p className="font-bold text-slate-900">Stillingens implisitte krav: {t.trait}</p>
                                <p className="text-slate-600 italic mt-1">&ldquo;{t.evidenceInText}&rdquo;</p>
                              </div>
                              <div className="border-l border-slate-200 pl-3 flex flex-col justify-center">
                                <p className="font-bold text-slate-800">Din profil:</p>
                                {matchedKey ? (
                                  <p className="text-indigo-900 font-semibold mt-1">
                                    {dimensionsData[matchedKey].name}: {userScoreText}
                                  </p>
                                ) : (
                                  <p className="text-slate-500 italic">Generell egenskap.</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Superpowers */}
                    <div className="space-y-3 break-inside-avoid">
                      <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b pb-1">3. Dine Største Superkrefter i denne Rollen</h2>
                      <div className="space-y-4">
                        {analysis.superpowers?.map((s: any, idx: number) => (
                          <div key={idx} className="space-y-1 text-sm break-inside-avoid">
                            <p className="font-bold text-slate-900">{idx+1}. {s.trait}</p>
                            <p className="text-slate-600"><span className="font-semibold text-slate-800">Hvorfor det passer:</span> {s.whyItFits}</p>
                            <p className="text-slate-600 italic"><span className="font-semibold text-slate-700">Intervjutips:</span> {s.interviewTip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Friksjonspunkter */}
                    <div className="space-y-3 break-inside-avoid">
                      <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b pb-1">4. Situasjonsbetingede Friksjonspunkter</h2>
                      <div className="space-y-4">
                        {analysis.frictionPoints?.map((f: any, idx: number) => (
                          <div key={idx} className="space-y-1 text-sm break-inside-avoid">
                            <p className="font-bold text-slate-900">{idx+1}. Friksjonsområde</p>
                            <p className="text-slate-600"><span className="font-semibold text-slate-800">Spenning:</span> {f.tension}</p>
                            <p className="text-slate-600 italic"><span className="font-semibold text-slate-700">Kompenseringsstrategi på intervjuet:</span> {f.compensationStrategy}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Intervjuspørsmål */}
                    <div className="space-y-3 break-inside-avoid">
                      <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b pb-1">5. Tøffe Spørsmål fra Rekruttereren (Simulering)</h2>
                      <div className="space-y-4">
                        {analysis.interviewQuestions?.map((q: any, idx: number) => (
                          <div key={idx} className="space-y-1 text-sm break-inside-avoid">
                            <p className="font-bold text-slate-900 italic">Spørsmål: &ldquo;{q.question}&rdquo;</p>
                            <p className="text-slate-600"><span className="font-semibold text-slate-800">Foreslått, ærlig vinkling:</span> {q.suggestedAngle}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dine STAR-notater */}
                    <div className="space-y-4 break-before-page">
                      <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b pb-1">6. Dine Personlige Forberedelser &amp; STAR-Historier</h2>
                      <p className="text-slate-500 text-xs mb-4">
                        Dine egne refleksjoner, historier og forberedte eksempler fra Mine Notater:
                      </p>
                      
                      {(Object.keys(dimensionsData) as DimensionKey[]).map((key) => {
                        const dim = dimensionsData[key];
                        const dimNote = notes[key] || { workExample: '', interviewStrength: '', awareness: '' };
                        const hasNotes = dimNote.workExample || dimNote.interviewStrength || dimNote.awareness;
                        if (!hasNotes) return null;

                        return (
                          <div key={key} className="mb-6 border-b pb-4 break-inside-avoid">
                            <h3 className="font-bold text-slate-900 text-sm border-b pb-1 mb-2 uppercase">{dim.name}</h3>
                            <div className="space-y-2 text-xs">
                              {dimNote.workExample && (
                                <div>
                                  <p className="font-bold text-slate-500">Eksempel fra arbeidshverdagen / STAR-historie:</p>
                                  <p className="text-slate-800 pl-2 border-l border-slate-200 mt-0.5 whitespace-pre-line">{dimNote.workExample}</p>
                                </div>
                              )}
                              {dimNote.interviewStrength && (
                                <div>
                                  <p className="font-bold text-slate-500">Styrke jeg kan forklare i intervju:</p>
                                  <p className="text-slate-800 pl-2 border-l border-slate-200 mt-0.5 whitespace-pre-line">{dimNote.interviewStrength}</p>
                                </div>
                              )}
                              {dimNote.awareness && (
                                <div>
                                  <p className="font-bold text-slate-500">Noe jeg bør være bevisst på (fallgruve):</p>
                                  <p className="text-slate-800 pl-2 border-l border-slate-200 mt-0.5 whitespace-pre-line">{dimNote.awareness}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              } catch (e) {
                // fallback
              }
            }

            return (
              /* STANDARD NOTES ONLY PRINT FORMAT */
              <div>
                <h1 className="text-2xl font-bold mb-2 text-slate-900">Mine Forberedelser til Jobbintervju (Big Five)</h1>
                <p className="text-slate-500 text-xs mb-6">Generert fra Big Five Forberedelse - {new Date().toLocaleDateString('no-NO')}</p>
                
                {(Object.keys(dimensionsData) as DimensionKey[]).map((key) => {
                  const dim = dimensionsData[key];
                  const dimNote = notes[key] || { workExample: '', interviewStrength: '', awareness: '' };

                  return (
                    <div key={key} className="mb-8 border-b pb-6 break-inside-avoid">
                      <h2 className="text-lg font-bold border-b pb-1 mb-3 text-slate-900">{dim.name}</h2>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-slate-400 uppercase">1. Eksempel fra arbeidshverdagen</h3>
                          {dimNote.workExample ? (
                            <p className="text-slate-800 text-sm whitespace-pre-line pl-1">{dimNote.workExample}</p>
                          ) : (
                            <p className="text-slate-400 text-xs italic pl-1 border border-dashed border-slate-200 p-3 rounded-lg bg-slate-50/50">
                              Ingen notater skrevet. Skriv ned en spesifikk situasjon der du demonstrerte denne egenskapen.
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-slate-400 uppercase">2. Styrke jeg kan forklare i intervju</h3>
                          {dimNote.interviewStrength ? (
                            <p className="text-slate-800 text-sm whitespace-pre-line pl-1">{dimNote.interviewStrength}</p>
                          ) : (
                            <p className="text-slate-400 text-xs italic pl-1 border border-dashed border-slate-200 p-3 rounded-lg bg-slate-50/50">
                              Ingen notater skrevet. Hvordan vil du presentere dine positive sider og styrker for intervjueren?
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-slate-400 uppercase">3. Noe jeg bør være bevisst på (Fallgruver / Utviklingsområder)</h3>
                          {dimNote.awareness ? (
                            <p className="text-slate-800 text-sm whitespace-pre-line pl-1">{dimNote.awareness}</p>
                          ) : (
                            <p className="text-slate-400 text-xs italic pl-1 border border-dashed border-slate-200 p-3 rounded-lg bg-slate-50/50">
                              Ingen notater skrevet. Hvilke fallgruver opplever du og hvordan kompenserer du for dem i hverdagen?
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
