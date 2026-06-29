import React, { useState } from 'react';
import { statements, DimensionKey, dimensionsData, bandsData } from '../data/statements';
import { HelpCircle, RefreshCw, MessageSquare, AlertCircle, FileText, Lock } from 'lucide-react';

interface InterviewPrepProps {
  answers: Record<string, number>;
  onNavigateToTab: (tabId: string) => void;
}

export default function InterviewPrep({ answers, onNavigateToTab }: InterviewPrepProps) {
  const [activeDimKey, setActiveDimKey] = useState<DimensionKey>('planmessighet');

  // Verify completeness
  const totalStatementsCount = statements.length;
  const answeredCount = statements.filter(s => answers[s.id] !== undefined).length;
  const isCompleted = answeredCount === totalStatementsCount;

  // 1. Lock Screen (If questionnaire is not finished)
  if (!isCompleted) {
    return (
      <div id="prep-locked" className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-slate-200/60 rounded-xl p-8 shadow-xs">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Intervjuforberedelsen er låst</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            For å generere skreddersydde intervjuspørsmål, refleksjonspunkter og eksempelsvar tilpasset din personlighetsprofil, må du fullføre alle 60 påstandene i spørreskjemaet først.
          </p>

          <button
            onClick={() => onNavigateToTab('questionnaire')}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-xs cursor-pointer"
          >
            Fortsett spørreskjemaet
          </button>
        </div>
      </div>
    );
  }

  // Calculate scores and bands
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

  const activeScore = getScore(activeDimKey);
  const activeBand = getBand(activeScore);
  const activeContent = bandsData[activeDimKey][activeBand];
  const activeInfo = dimensionsData[activeDimKey];

  return (
    <div id="interview-prep-view" className="max-w-5xl mx-auto py-6 px-4">
      
      {/* Header text */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Praktisk Intervjuforberedelse
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          I et intervju etter en personlighetstest vil rekruttereren ofte stille spørsmål om dine "ytterpunkter" eller be deg nyansere dine styrker og fallgruver. 
          Her finner du skreddersydd materiell basert på dine svar.
        </p>
      </div>

      {/* Tabs navigation for the 5 dimensions */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6">
        {(Object.keys(dimensionsData) as DimensionKey[]).map((key) => {
          const name = dimensionsData[key].name;
          const isActive = activeDimKey === key;
          const score = getScore(key);
          const band = getBand(score);

          return (
            <button
              key={key}
              id={`tab-prep-${key}`}
              onClick={() => setActiveDimKey(key)}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span>{name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {band}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preparation content blocks */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Info Summary (4 cols) */}
        <div className="md:col-span-4 bg-slate-50 border border-slate-200/60 p-5 rounded-xl space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Din profil på {activeInfo.name}
            </span>
            <h3 className="font-bold text-slate-900 text-lg">
              Tendens: {activeBand} ({activeScore.toFixed(1)})
            </h3>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              Ditt svarnivå tyder på at du har en <strong>{activeBand.toLowerCase()}</strong> preferanse innenfor denne dimensjonen. 
              Det betyr at dine styrker og utfordringer spesielt vil vise seg i situasjoner der denne egenskapen utfordres eller kreves.
            </p>
          </div>

          <div className="border-t border-slate-200/80 pt-4 space-y-2">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Trekk er kontekstavhengige:</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Husk at personlighetstrekk <strong>ikke er absolutte styrker eller svakheter</strong>. Et trekk som er en fordel i én rolle (f.eks. høyt detaljfokus i kvalitetssikring), kan være en utfordring i en annen (f.eks. ved behov for raske beslutninger). 
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Målet på intervjuet er ikke å presentere en "perfekt optimalisert" profil, men å vise at du forstår hvordan dine naturlige tendenser passer inn, og hvordan du kompenserer når rollen krever noe annet.
            </p>
          </div>

          <div className="bg-white p-3.5 border border-slate-200/70 rounded-lg text-xs space-y-2 text-slate-600">
            <span className="font-bold text-slate-800 block">💡 Autentisitet som vinnerstrategi:</span>
            <p className="leading-relaxed">
              Ekte rekrutteringstester har innebygde mekanismer for å avdekke forsøk på å pynte på sannheten. Ærlige, konsistente og reflekterte svar er den eneste bærekraftige strategien – det bygger tillit og sikrer at du lander i en jobb du trives i.
            </p>
          </div>
        </div>

        {/* Right Side Practice Content (8 cols) */}
        <div id="prep-practice-panel" className="md:col-span-8 space-y-6">
          
          {/* Sannsynlige oppfølgingsspørsmål */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-50 pb-3">
              <HelpCircle className="w-5 h-5 text-teal-600" />
              Sannsynlige oppfølgingsspørsmål fra intervjuer
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Dette er konkrete spørsmål en erfaren rekrutterer eller psykolog kan stille deg basert på en slik profil for å utfordre deg:
            </p>
            <div className="space-y-3">
              {activeContent.interviewQuestions.map((q, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                  <span className="text-xs font-bold bg-white text-slate-500 w-6 h-6 border rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-900 font-semibold text-sm sm:text-base leading-relaxed">
                    "{q}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Refleksjonsprompter */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-50 pb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              Korte refleksjonsprompter til deg selv
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Bruk disse til å identifisere egne historier og erfaringer du kan fortelle om i møtet:
            </p>
            <div className="space-y-3">
              {activeContent.prompts.map((p, idx) => (
                <div key={idx} className="p-4 bg-indigo-50/20 border border-indigo-100/50 rounded-lg flex items-start gap-3">
                  <span className="text-xs font-bold bg-white text-indigo-600 w-6 h-6 border rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-800 text-sm leading-relaxed font-medium">
                    {p}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Eksempler på ærlige svar */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-50 pb-3">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Eksempler på ærlige og gode svar (uten å overselge)
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Slik kan du svare profesjonelt. Legg merke til hvordan svarene viser selvinnsikt, anerkjenner utfordringen, og deretter forklarer hvordan du kompenserer:
            </p>
            <div className="space-y-4">
              {activeContent.honestAnswers.map((ans, idx) => (
                <div key={idx} className="p-4 border-l-4 border-emerald-500 bg-emerald-50/20 rounded-r-lg">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    Eksempel {idx + 1}
                  </span>
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    "{ans}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links to notes */}
          <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h5 className="font-bold text-sm">Har du dine egne historier klare?</h5>
              <p className="text-slate-300 text-xs mt-0.5">
                Skriv ned dine egne eksempler, styrker og bevissthetsområder i notatboken din.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('notes')}
              className="bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs px-4 py-2 rounded-lg transition shrink-0 cursor-pointer"
            >
              Gå til notatboken
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
