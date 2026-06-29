import React, { useState, useEffect } from 'react';
import { statements, DimensionKey, dimensionsData, resolveDimensionKey } from '../data/statements';
import { usePremium } from '../premium/PremiumContext';
import { useFeedback } from '../ui/Feedback';
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  Printer, 
  Download, 
  RefreshCw, 
  Lock, 
  ChevronRight, 
  ArrowRight,
  ShieldAlert,
  BookOpen,
  Trash2,
  Clock,
  History
} from 'lucide-react';
// pdfExport (jspdf + html2canvas, ~heavy) is imported dynamically in
// handleExportPdf so it's only loaded when the user actually exports a PDF.

interface JobAnalysisProps {
  answers: Record<string, number>;
  notes: Record<string, { workExample: string; interviewStrength: string; awareness: string }>;
  onSaveNote: (dimKey: DimensionKey, field: 'workExample' | 'interviewStrength' | 'awareness', value: string) => void;
  onNavigateToTab: (tabId: string) => void;
}

interface AnalysisResult {
  impliedTraits: Array<{
    trait: string;
    evidenceInText: string;
  }>;
  matchBand: 'Svak' | 'Moderat' | 'Sterk';
  matchAnalysis: string;
  superpowers: Array<{
    trait: string;
    whyItFits: string;
    interviewTip: string;
  }>;
  frictionPoints: Array<{
    tension: string;
    compensationStrategy: string;
  }>;
  suggestedStarStories: Array<{
    dimension: string;
    prompt: string;
  }>;
  interviewQuestions: Array<{
    question: string;
    suggestedAngle: string;
  }>;
}

interface SavedAnalysis {
  id: string;
  jobTitle: string;
  jobDescription: string;
  analysis: AnalysisResult;
  createdAt: string;
}

const FREE_HISTORY_LIMIT = 1;
const PREMIUM_HISTORY_LIMIT = 25;

export default function JobAnalysis({ answers, notes, onSaveNote, onNavigateToTab }: JobAnalysisProps) {
  const { isPremium } = usePremium();
  const { toast } = useFeedback();

  // 1. Check questionnaire completeness
  const totalStatementsCount = statements.length;
  const answeredCount = statements.filter(s => answers[s.id] !== undefined).length;
  const isCompleted = answeredCount === totalStatementsCount;

  // 2. States for inputs
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [jobTitle, setJobTitle] = useState<string>(() => {
    return localStorage.getItem('bigfive_prep_job_title') || '';
  });
  const [jobDescription, setJobDescription] = useState<string>(() => {
    return localStorage.getItem('bigfive_prep_job_desc') || '';
  });

  // 3. States for API results
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem('bigfive_prep_job_analysis');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // 3b. Saved-analysis history (premium can keep many; free keeps the latest one).
  const [history, setHistory] = useState<SavedAnalysis[]>(() => {
    const saved = localStorage.getItem('bigfive_prep_job_analyses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const persistHistory = (next: SavedAnalysis[]) => {
    setHistory(next);
    localStorage.setItem('bigfive_prep_job_analyses', JSON.stringify(next));
  };

  // 4. Loading message rotator
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const loadingSteps = [
    "Henter og tolker dine Big Five-skårer...",
    "Leser gjennom stillingsbeskrivelsen din...",
    "Kobler personlighetstrekkene dine opp mot rollens krav...",
    "Identifiserer dine største styrker og fordeler i rollen...",
    "Avdekker potensielle utfordringer og kompenserende strategier...",
    "Genererer skreddersydde, tøffe intervjuspørsmål til deg...",
    "Ferdigstiller din personlige AI-rapport..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // 5. Auto-save inputs to localStorage on changes
  useEffect(() => {
    localStorage.setItem('bigfive_prep_job_title', jobTitle);
  }, [jobTitle]);

  useEffect(() => {
    localStorage.setItem('bigfive_prep_job_desc', jobDescription);
  }, [jobDescription]);

  // 6. Calculate user's dimension scores to send to the backend
  const getScore = (dim: DimensionKey): number => {
    const dimStatements = statements.filter(s => s.dimensjon === dim);
    let sum = 0;
    dimStatements.forEach(s => {
      const ans = answers[s.id] || 3;
      const actualVal = s.keyed === 'negativ' ? (6 - ans) : ans;
      sum += actualVal;
    });
    return sum / dimStatements.length;
  };

  const getBand = (score: number): 'Lav' | 'Moderat' | 'Høy' => {
    if (score <= 2.6) return 'Lav';
    if (score >= 3.7) return 'Høy';
    return 'Moderat';
  };

  const getDimensionScores = (): Record<string, { score: number; band: string }> => {
    const scores: Record<string, { score: number; band: string }> = {};
    const keys: DimensionKey[] = ['planmessighet', 'emosjonell_stabilitet', 'ekstroversjon', 'omgjengelighet', 'aapenhet'];
    keys.forEach(key => {
      const score = getScore(key);
      scores[key] = {
        score,
        band: getBand(score)
      };
    });
    return scores;
  };

  // 7. Call API
  const handleRunAnalysis = async () => {
    if (!jobTitle.trim()) {
      setError("Vennligst oppgi en stillingstittel først.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dimensionScores = getDimensionScores();
      
      let response;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        response = await fetch('/api/analyze-job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobTitle,
            jobDescription,
            dimensionScores
          }),
          signal: controller.signal,
        });
      } catch (networkErr) {
        throw new Error("Nettverksfeil eller tidsavbrudd.");
      } finally {
        clearTimeout(timeoutId);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error("Ugyldig respons-format fra serveren.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Serveren returnerte en feil.");
      }

      setAnalysis(data);
      localStorage.setItem('bigfive_prep_job_analysis', JSON.stringify(data));

      // Record in history. Premium keeps a list (capped); free keeps only the latest.
      const entry: SavedAnalysis = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        jobTitle,
        jobDescription,
        analysis: data,
        createdAt: new Date().toISOString(),
      };
      const limit = isPremium ? PREMIUM_HISTORY_LIMIT : FREE_HISTORY_LIMIT;
      persistHistory([entry, ...history].slice(0, limit));

      // Auto pre-fill recommended STAR-story prompts ONLY where the note is empty.
      // We never overwrite the user's own text or an existing template here — the
      // results panel exposes explicit per-story "Fyll inn / Overskriv" buttons
      // for that, so no disruptive confirm() dialogs are needed during generation.
      if (data.suggestedStarStories && Array.isArray(data.suggestedStarStories)) {
        data.suggestedStarStories.forEach((story: { dimension: string; prompt: string }) => {
          const dimKey = resolveDimensionKey(story.dimension);
          if (!dimKey) return;

          const existingNote = notes[dimKey];
          const hasExistingText = existingNote && existingNote.workExample?.trim();
          if (hasExistingText) return;

          const promptText = `💡 AI-FORSLAG FOR FORBEREDELSE:\nForbered en STAR-historie om:\n"${story.prompt}"\n\n[Skriv ditt eksempel her...]`;
          onSaveNote(dimKey, 'workExample', promptText);
        });
      }
    } catch (err: any) {
      console.error("Job analysis fetch/parse failed:", err);
      // Prefer the specific message (e.g. the server's rate-limit / network /
      // parse error) so the user knows what to do; fall back to a reassuring
      // generic note that their saved test results are intact.
      const msg =
        typeof err?.message === 'string' && err.message.trim()
          ? err.message
          : "Analysen kunne ikke fullføres akkurat nå — tentamen-resultatene dine er trygt lagret. Prøv igjen senere.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAnalysis = () => {
    setAnalysis(null);
    localStorage.removeItem('bigfive_prep_job_analysis');
  };

  // Load a saved analysis from history as the active one.
  const handleSelectSaved = (entry: SavedAnalysis) => {
    setJobTitle(entry.jobTitle);
    setJobDescription(entry.jobDescription);
    setAnalysis(entry.analysis);
    localStorage.setItem('bigfive_prep_job_analysis', JSON.stringify(entry.analysis));
    window.scrollTo({ top: 0 });
  };

  // Remove a saved analysis from history.
  const handleDeleteSaved = (id: string) => {
    persistHistory(history.filter((h) => h.id !== id));
  };

  // 8. Export result as txt
  const handleExportTxt = () => {
    if (!analysis) return;
    let content = `AI-JOBBMATCH & ANALYSE - BIG FIVE FORBEREDELSE\n`;
    content += `==================================================\n`;
    content += `Dato: ${new Date().toLocaleDateString('no-NO')}\n`;
    content += `Stilling: ${jobTitle}\n`;
    content += `Estimert match-nivå: ${analysis.matchBand} Match\n`;
    content += `==================================================\n\n`;

    content += `OVERORDNET MATCH-ANALYSE:\n`;
    content += `-------------------------\n`;
    content += `${analysis.matchAnalysis}\n\n`;

    content += `DINE STØRSTE SUPERKREFTER I DENNE ROLLEN:\n`;
    content += `-------------------------------------\n`;
    analysis.superpowers.forEach((s, i) => {
      content += `${i + 1}. Trekk: ${s.trait}\n`;
      content += `   Hvorfor det passer: ${s.whyItFits}\n`;
      content += `   Tips til intervjuet: ${s.interviewTip}\n\n`;
    });

    content += `SITUASJONSBETINGET FRIKSJON OG STRATEGIER:\n`;
    content += `----------------------------------------\n`;
    analysis.frictionPoints.forEach((f, i) => {
      content += `${i + 1}. Spenning: ${f.tension}\n`;
      content += `   Kompenseringsstrategi på intervjuet: ${f.compensationStrategy}\n\n`;
    });

    content += `SKREDDERSYDDE INTERVJUSPØRSMÅL & SVARVINKLING:\n`;
    content += `----------------------------------------\n`;
    analysis.interviewQuestions.forEach((q, i) => {
      content += `Spørsmål ${i + 1}: "${q.question}"\n`;
      content += `Foreslått, ærlig vinkling på svaret: "${q.suggestedAngle}"\n\n`;
    });

    content += `==================================================\n`;
    content += `Personvern: Denne analysen ble generert av Google Gemini basert på stillingsinfoen og dine Big Five-skårer. Selve rapporten lagres lokalt i nettleseren din.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `big_five_jobbanalyse_${jobTitle.replace(/\s+/g, '_').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    const sanitizedTitle = jobTitle.trim().replace(/\s+/g, '_').toLowerCase() || 'forberedelse';
    const filename = `intervjubriefing_${sanitizedTitle}.pdf`;
    try {
      // Lazy-load the heavy PDF libraries only on first export.
      const { exportBriefingToPdf } = await import('../utils/pdfExport');
      const ok = await exportBriefingToPdf('briefing-print-section', filename, { watermark: !isPremium });
      if (!ok) {
        toast('Kunne ikke lage PDF akkurat nå. Prøv «Skriv ut» som alternativ.', 'error');
      }
    } catch (e) {
      console.error('PDF export failed to load/run:', e);
      toast('Kunne ikke lage PDF akkurat nå. Prøv «Skriv ut» som alternativ.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div id="job-analysis-view" className="max-w-5xl mx-auto py-6 px-4">
      
      {/* 1. Header (Always visible) */}
      <div className="mb-8 text-center md:text-left print:hidden">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100/50 px-3 py-1 rounded-full text-teal-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Eksklusiv AI-drevet matching</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          AI Jobbanalyse og Profilmatching
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Skriv inn stillingen du søker på og eventuelt stillingsbeskrivelsen. 
          Gemini AI vil automatisk analysere din personlighetsprofil opp mot rollens krav og gi deg skreddersydde styrker, utfordringer og intervjusvar!
        </p>
      </div>

      {/* 2. Lock Overlay and Form Grid (If not completed questionnaire) */}
      {!isCompleted ? (
        <div className="grid md:grid-cols-12 gap-8 items-start print:hidden">
          
          {/* Left Form (Teaser style) */}
          <div className="md:col-span-7 bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-4 opacity-75">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-500" />
              1. Jobbinformasjon
            </h3>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase">Stillingstittel du søker på *</label>
              <input
                type="text"
                disabled
                value={isCompleted ? jobTitle : ""}
                placeholder="F.eks. Prosjektleder, Kundekonsulent, Utvikler..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase">Stillingsbeskrivelse / Annonsetekst (Valgfri)</label>
              <textarea
                disabled
                rows={5}
                value={isCompleted ? jobDescription : ""}
                placeholder="Lim inn teksten fra stillingsannonsen eller en kort beskrivelse av rollen her..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 cursor-not-allowed"
              />
            </div>

            <button
              disabled
              className="w-full bg-slate-200 text-slate-500 font-medium py-2.5 rounded-lg text-sm transition cursor-not-allowed"
            >
              Start AI-analyse
            </button>
          </div>

          {/* Right Lock Banner */}
          <div className="md:col-span-5 bg-teal-50/50 border border-teal-100/50 rounded-xl p-6 shadow-xs text-center md:text-left space-y-4">
            <div className="w-12 h-12 bg-teal-100/60 rounded-full flex items-center justify-center text-teal-700 mx-auto md:mx-0">
              <Lock className="w-5 h-5" />
            </div>
            
            <h3 className="font-bold text-slate-900 text-lg">AI-analysen er låst</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              For at Gemini skal kunne gjøre en grundig og personlig match, må du fullføre de 60 påstandene i personlighetstesten din først. 
            </p>

            <div className="bg-white p-4 border border-teal-100/20 rounded-lg text-xs space-y-2 text-slate-600">
              <span className="font-bold text-slate-800 block">Dette får du tilgang til:</span>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Kvalitativt match-bånd for den spesifikke jobben</li>
                <li>Dine 3 største Big Five-superkrefter i denne rollen</li>
                <li>Avklarte utfordringer med profesjonelle mottiltak</li>
                <li>3 spesialiserte intervjuspørsmål tilpasset din personlighet</li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToTab('questionnaire')}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              Fullfør spørreskjemaet ({answeredCount}/60)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* 3. Fully Unlocked Feature Grid (If Completed Questionnaire) */
        <div className="print:hidden">

          {/* Saved analyses (premium history) */}
          {isPremium && history.length > 0 && (
            <div className="max-w-3xl mx-auto mb-6 bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-teal-600" />
                Lagrede jobbanalyser
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-sm font-bold">PREMIUM</span>
              </h4>
              <ul className="space-y-2">
                {history.map((entry) => {
                  const isActive = !!analysis && JSON.stringify(entry.analysis) === JSON.stringify(analysis);
                  return (
                    <li
                      key={entry.id}
                      className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border text-xs ${
                        isActive ? 'bg-teal-50/60 border-teal-200' : 'bg-slate-50/60 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectSaved(entry)}
                        className="flex-1 text-left cursor-pointer"
                      >
                        <span className="font-semibold text-slate-900 block truncate">
                          {entry.jobTitle || 'Uten tittel'}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.createdAt).toLocaleDateString('no-NO')}
                          {isActive && <span className="text-teal-700 font-semibold ml-1">· vises nå</span>}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteSaved(entry.id)}
                        title="Slett denne analysen"
                        aria-label={`Slett lagret analyse: ${entry.jobTitle || 'uten tittel'}`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Free-tier upsell: saving multiple analyses is premium */}
          {!isPremium && history.length > 0 && (
            <div className="max-w-3xl mx-auto mb-6 bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-950 block">Vil du lagre og sammenligne flere jobbanalyser?</span>
                <span className="text-amber-900/90">
                  Gratisversjonen beholder kun den siste. Med premium kan du lagre flere stillinger og bytte mellom dem. Aktiver i Personvern-fanen.
                </span>
              </div>
            </div>
          )}

          {/* Input Panel (Form) */}
          {!analysis && !loading && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6 print:hidden">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-700">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Hva slags jobb søker du på?
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Oppgi stillingen du forbereder deg til for å skreddersy din rekrutterings-briefing.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-950 text-xs sm:text-sm flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold">Kunne ikke gjennomføre analysen</p>
                    <p className="text-rose-900/90">{error}</p>
                    <button
                      onClick={handleRunAnalysis}
                      disabled={!jobTitle.trim()}
                      className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Prøv igjen
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Stillingstittel du søker på *</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="F.eks. Salgssjef, Sykepleier, Seniorkonsulent, Kontormedarbeider..."
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Stillingsbeskrivelse / Annonsetekst (Valgfri, men anbefalt)</label>
                  <p className="text-xs text-slate-400">
                    Lim inn teksten fra utlysningsannonsen. Jo mer detaljert tekst du limer inn, desto mer presis blir analysen av arbeidskrav og personlighetstrekk.
                  </p>
                  <textarea
                    rows={8}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Lim inn hele stillingsannonsen eller en liste med arbeidsoppgaver her..."
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/20"
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

              <div className="pt-2">
                <button
                  onClick={handleRunAnalysis}
                  disabled={!jobTitle.trim()}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    jobTitle.trim()
                      ? 'bg-teal-700 hover:bg-teal-800 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Analyser min profil mot stillingen med AI
                </button>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2.5 flex items-start gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Når du starter analysen, sendes stillingstittel, stillingsbeskrivelse og dine Big Five-skårer til <strong>Google Gemini</strong> for å generere rapporten. Ikke lim inn sensitive personopplysninger. Resten av appen fungerer 100&nbsp;% lokalt.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div role="status" aria-live="polite" aria-busy="true" className="max-w-md mx-auto py-16 px-4 text-center space-y-6 print:hidden">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-teal-100 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-teal-700 border-t-transparent animate-spin"></div>
              </div>

              <div className="space-y-2 animate-fade-in">
                <h3 className="text-slate-900 font-bold text-lg">
                  Gemini analyserer jobbmatchen...
                </h3>
                <p className="text-teal-700 font-medium text-xs sm:text-sm bg-teal-50 border border-teal-100/30 py-2 px-3 rounded-lg max-w-xs mx-auto">
                  {loadingSteps[loadingStep]}
                </p>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto pt-2">
                  Dette tar vanligvis mellom 10-20 sekunder. Vennligst ikke lukk fanen eller naviger bort.
                </p>
              </div>
            </div>
          )}

          {/* Results Analysis Panel */}
          {analysis && !loading && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Actions Header Bar */}
              <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs print:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center text-teal-700">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Analyse for: <span className="text-teal-800">{jobTitle}</span>
                    </h4>
                    <p className="text-slate-500 text-xs">
                      Suksessfullt generert av Gemini AI
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handlePrint}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Skriv ut rapporten"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Skriv ut</span>
                  </button>

                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="p-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last ned briefing som PDF"
                  >
                    {isExportingPdf ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Genererer PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Last ned (PDF)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExportTxt}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Last ned som tekstfil"
                  >
                    <Download className="w-4 h-4" />
                    <span>Last ned (.txt)</span>
                  </button>

                  <button
                    onClick={handleClearAnalysis}
                    className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Ny stilling</span>
                  </button>
                </div>
              </div>

              {/* Main Analysis Body (Grid) */}
              <div className="grid md:grid-cols-12 gap-8 items-start">
                
                {/* Match Band Widget (Left column, 4 cols) */}
                <div className="md:col-span-4 bg-white border border-slate-200/60 rounded-xl p-6 shadow-xs text-center space-y-5">
                  
                  {/* Qualitative Match Band Display */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kvalitativ Jobbmatch
                    </span>
                    
                    {/* Visual indicators of the three bands */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      {['Svak', 'Moderat', 'Sterk'].map((band) => {
                        const isActive = analysis.matchBand === band;
                        const colors = {
                          'Svak': isActive ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-xs' : 'bg-slate-50 text-slate-400 border-slate-200/50',
                          'Moderat': isActive ? 'bg-teal-100 text-teal-950 border-teal-300 font-bold shadow-xs' : 'bg-slate-50 text-slate-400 border-slate-200/50',
                          'Sterk': isActive ? 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold shadow-xs' : 'bg-slate-50 text-slate-400 border-slate-200/50',
                        }[band as 'Svak' | 'Moderat' | 'Sterk'];

                        return (
                          <div
                            key={band}
                            className={`py-2 px-4 rounded-lg border text-sm transition-all flex items-center justify-between ${colors}`}
                          >
                            <span>{band} Match</span>
                            {isActive && (
                              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-semibold text-slate-500">
                        Vurdert nivå:
                      </p>
                      <p className="font-bold text-slate-900 text-base">
                        {analysis.matchBand} Match
                      </p>
                    </div>
                  </div>

                  {/* Short Justification Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">Begrunnelse</h5>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {analysis.matchAnalysis}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3 text-left">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Hva betyr denne matchen?</h5>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Vurderingen reflekterer i hvilken grad dine estimerte Big Five-tendenser samsvarer harmonisk med kravene og dynamikken i en stilling som <strong>{jobTitle}</strong>.
                    </p>
                    <p className="text-slate-500 text-[11px] leading-relaxed italic">
                      💡 Husk: Svakere samsvar betyr bare at du må jobbe litt annerledes med oppgavene, noe som er ypperlig å demonstrere selvinnsikt om på intervjuet!
                    </p>
                  </div>
                </div>

                {/* Detailed Analysis (Right column, 8 cols) */}
                <div className="md:col-span-8 space-y-6">
                  
                  {/* Overordnet Match Tekst */}
                  <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-xs">
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                      <FileText className="w-5 h-5 text-teal-600" />
                      Overordnet Match-Analyse
                    </h4>
                    <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
                      {analysis.matchAnalysis}
                    </div>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-4">
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-50 pb-3">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                      Rolleanalyse &amp; Personlighetsprofil (Side-ved-side)
                    </h4>
                    <p className="text-slate-500 text-xs">
                      Dette stiller stillingens implisitte krav side om side med dine estimerte Big Five-tendenser for å gi deg et klart bilde av hvor du matcher perfekt, og hvor det kreves bevisstgjøring:
                    </p>

                    <div className="space-y-4">
                      {analysis.impliedTraits?.map((t, idx) => {
                        let userBand = '';
                        let userScoreText = '';

                        const matchedKey = resolveDimensionKey(t.trait);

                        if (matchedKey) {
                          const score = getScore(matchedKey);
                          userBand = getBand(score);
                          userScoreText = `${userBand} tendens (${score.toFixed(1)}/5)`;
                        }

                        return (
                          <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl grid sm:grid-cols-2 gap-4">
                            {/* Job Requirement */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                                Stillingens krav
                              </span>
                              <h5 className="font-bold text-slate-900 text-sm">{t.trait}</h5>
                              <p className="text-slate-600 text-xs italic leading-relaxed">
                                &ldquo;{t.evidenceInText}&rdquo;
                              </p>
                            </div>
                            
                            {/* Your Profile */}
                            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-center">
                              <span className="text-[10px] uppercase font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded self-start">
                                Din profil
                              </span>
                              {matchedKey ? (
                                <div className="mt-1">
                                  <p className="font-bold text-slate-900 text-sm">
                                    {dimensionsData[matchedKey].name}
                                  </p>
                                  <p className="text-slate-600 text-xs">
                                    Ditt resultat: <span className="font-semibold text-indigo-700">{userScoreText}</span>
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    {userBand === 'Høy' && 'Du har en naturlig styrke her.'}
                                    {userBand === 'Moderat' && 'Du balanserer dette godt i hverdagen.'}
                                    {userBand === 'Lav' && 'Intervjueren vil kanskje utfordre deg på dette.'}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-slate-400 text-xs italic mt-1">
                                  Koblet mot generelle egenskaper.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommended STAR stories */}
                  <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-4">
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-50 pb-3">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Anbefalte STAR-historier for denne stillingen
                    </h4>
                    <p className="text-slate-500 text-xs">
                      Gemini AI anbefaler at du forbereder spesifikke eksempler på disse områdene. De er også automatisk lagt inn i dine refleksjonsnotater:
                    </p>

                    <div className="grid gap-4">
                      {analysis.suggestedStarStories?.map((story, idx) => {
                        const dimKey = resolveDimensionKey(story.dimension);
                        const dimName = (dimKey && dimensionsData[dimKey]?.name) || story.dimension;
                        const currentNote = (dimKey && notes[dimKey]?.workExample) || '';
                        const isPreFilled = currentNote.includes(story.prompt) || currentNote.length > 50;

                        return (
                          <div key={idx} className="p-4 bg-indigo-50/10 border border-indigo-100/30 rounded-xl space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-indigo-800 uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                {dimName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">STAR-oppgave {idx+1}</span>
                            </div>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed">
                              &ldquo;{story.prompt}&rdquo;
                            </p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <span className="text-xs text-slate-500">
                                {isPreFilled ? '✅ Lagt inn i Mine Notater' : 'ℹ️ Ikke fylt ut ennå'}
                              </span>
                              {dimKey && (
                                <button
                                  onClick={() => {
                                    const textToFill = `💡 AI-FORSLAG FOR FORBEREDELSE:\nForbered en STAR-historie om:\n"${story.prompt}"\n\n[Skriv ditt eksempel her...]`;
                                    onSaveNote(dimKey, 'workExample', textToFill);
                                    toast(`Lagt inn i Mine Notater for ${dimName}.`, 'success');
                                  }}
                                  className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold cursor-pointer"
                                >
                                  {isPreFilled ? 'Overskriv / Fyll inn på nytt' : 'Fyll inn nå'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dine Styrker */}
                  <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-4">
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-50 pb-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Dine største Big Five-superkrefter i denne rollen
                    </h4>
                    <p className="text-slate-500 text-xs">
                      Basert på din profil er dette de egenskapene du vil kunne dra aller størst nytte av i stillingen:
                    </p>

                    <div className="grid gap-4">
                      {analysis.superpowers?.map((s, idx) => (
                        <div key={idx} className="p-4 bg-emerald-50/10 border border-emerald-100/50 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-emerald-800 uppercase bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                              {s.trait}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Superkraft {idx+1}</span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base">{s.trait}</h5>
                          <p className="text-slate-600 text-sm leading-relaxed">{s.whyItFits}</p>
                          <div className="bg-white p-3 border border-slate-100 rounded-lg text-xs text-slate-600 mt-2">
                            <strong className="text-slate-800 font-semibold block mb-0.5">💡 Tips til intervjuet:</strong>
                            {s.interviewTip}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Utfordringer / Bevissthetsområder */}
                  <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-4">
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-50 pb-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Situasjonsbetingede friksjonspunkter og kompenserende strategier
                    </h4>
                    <p className="text-slate-500 text-xs">
                      Her kan det oppstå friksjon mellom dine naturlige tendenser og rollens krav. Her er hvordan du kan vise at du kompenserer på en ærlig og bevisst måte:
                    </p>

                    <div className="grid gap-4">
                      {analysis.frictionPoints?.map((f, idx) => (
                        <div key={idx} className="p-4 bg-amber-50/10 border border-amber-100/40 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-amber-800 uppercase bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                              Friksjonspunkt
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Område {idx+1}</span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{f.tension}</p>
                          <div className="bg-amber-50/30 p-3 border border-amber-100/30 rounded-lg text-xs text-slate-700 mt-2">
                            <strong className="text-amber-950 font-semibold block mb-0.5">🔑 Din kompenseringsstrategi på intervju:</strong>
                            {f.compensationStrategy}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skreddersydde Intervjuspørsmål */}
                  <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="border-b border-slate-800 pb-4">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-teal-400" />
                        AI-Skreddersydde Intervjuspørsmål
                      </h4>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                        Intervjuere vil ofte utfordre deg på dine personlighetsegenskaper. Her er tøffe, realistiske intervjuspørsmål du kan forberede deg på for denne stillingen, og hvordan du svarer ærlig og reflektert:
                      </p>
                    </div>

                    <div className="space-y-6">
                      {analysis.interviewQuestions?.map((q, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {idx+1}
                            </span>
                            <p className="font-bold text-sm sm:text-base text-slate-100 italic">
                              "{q.question}"
                            </p>
                          </div>

                          <div className="pl-9 space-y-2">
                            <div className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-300 leading-relaxed italic border-l-2 border-l-teal-500">
                              <span className="font-bold text-teal-400 block mb-1 text-[10px] uppercase tracking-wider not-italic">Anbefalt, ærlig svarvinkling:</span>
                              "{q.suggestedAngle}"
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
