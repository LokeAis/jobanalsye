import React, { useState } from 'react';
import { DimensionKey, dimensionsData, statements } from '../data/statements';
import { usePremium } from '../premium/PremiumContext';
import { Save, Printer, Download, BookOpen, Layers, CheckCircle, RefreshCw } from 'lucide-react';
// pdfExport (jspdf + html2canvas) is imported dynamically in handleExportPdf so
// the heavy libraries load only when the user actually exports a PDF.

interface NotesSectionProps {
  notes: Record<string, { workExample: string; interviewStrength: string; awareness: string }>;
  onSaveNote: (dimKey: DimensionKey, field: 'workExample' | 'interviewStrength' | 'awareness', value: string) => void;
  answers: Record<string, number>;
}

export default function NotesSection({ notes, onSaveNote, answers }: NotesSectionProps) {
  const { isPremium } = usePremium();
  const [activeDimKey, setActiveDimKey] = useState<DimensionKey>('planmessighet');
  const [saveStatus, setSaveStatus] = useState<string>('Lagret automatisk');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const totalStatementsCount = statements.length;
  const answeredCount = statements.filter(s => answers[s.id] !== undefined).length;
  const isCompleted = answeredCount === totalStatementsCount;

  // Helper to calculate bands if available to display as context
  const getBandForDim = (dim: DimensionKey): string => {
    if (!isCompleted) return '';
    const dimStatements = statements.filter(s => s.dimensjon === dim);
    let sum = 0;
    dimStatements.forEach(s => {
      const ans = answers[s.id] || 3;
      const actualVal = s.keyed === 'negativ' ? (6 - ans) : ans;
      sum += actualVal;
    });
    const avg = sum / dimStatements.length;
    if (avg <= 2.6) return 'Lav';
    if (avg >= 3.7) return 'Høy';
    return 'Moderat';
  };

  const handleTextChange = (
    dimKey: DimensionKey, 
    field: 'workExample' | 'interviewStrength' | 'awareness', 
    val: string
  ) => {
    onSaveNote(dimKey, field, val);
    setSaveStatus('Lagrer...');
    setTimeout(() => {
      setSaveStatus('Alt lagret lokalt');
    }, 400);
  };

  // Export notes to a readable text file
  const handleExportTxt = () => {
    let content = `BIG FIVE FORBEREDELSE - MINE REFLEKSJONSNOTATER\n`;
    content += `==================================================\n`;
    content += `Dato: ${new Date().toLocaleDateString('no-NO')}\n`;
    content += `Dette dokumentet inneholder dine personlige refleksjoner og forberedelser til jobbintervjuet.\n\n`;

    (Object.keys(dimensionsData) as DimensionKey[]).map((key) => {
      const dim = dimensionsData[key];
      const band = getBandForDim(key);
      const dimNote = notes[key] || { workExample: '', interviewStrength: '', awareness: '' };

      content += `--------------------------------------------------\n`;
      content += `${dim.name.toUpperCase()} ${band ? `(Estimerte tendens: ${band})` : ''}\n`;
      content += `--------------------------------------------------\n`;
      content += `1. EKSEMPEL FRA ARBEIDSHVERDAGEN:\n`;
      content += `   ${dimNote.workExample || 'Ikke skrevet noe ennå.'}\n\n`;
      content += `2. STYRKE JEG KAN FORKLARE I INTERVJU:\n`;
      content += `   ${dimNote.interviewStrength || 'Ikke skrevet noe ennå.'}\n\n`;
      content += `3. NOE JEG BØR VÆRE BEVISST PÅ (FALLGRUVER):\n`;
      content += `   ${dimNote.awareness || 'Ikke skrevet noe ennå.'}\n\n\n`;
    });

    content += `==================================================\n`;
    content += `Personvern: Alt innhold i denne filen ble lagret og generert lokalt i din nettleser.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'big_five_forberedelse_notater.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    const savedTitle = localStorage.getItem('bigfive_prep_job_title') || '';
    const sanitizedTitle = savedTitle.trim().replace(/\s+/g, '_').toLowerCase() || 'forberedelse';
    const filename = `intervjubriefing_${sanitizedTitle}.pdf`;
    try {
      const { exportBriefingToPdf } = await import('../utils/pdfExport');
      const ok = await exportBriefingToPdf('briefing-print-section', filename, { watermark: !isPremium });
      if (!ok) {
        alert('Kunne ikke lage PDF akkurat nå. Prøv «Skriv ut» som alternativ.');
      }
    } catch (e) {
      console.error('PDF export failed to load/run:', e);
      alert('Kunne ikke lage PDF akkurat nå. Prøv «Skriv ut» som alternativ.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const activeNote = notes[activeDimKey] || { workExample: '', interviewStrength: '', awareness: '' };
  const activeInfo = dimensionsData[activeDimKey];
  const activeBand = getBandForDim(activeDimKey);

  return (
    <div id="notes-section-view" className="max-w-5xl mx-auto py-6 px-4">
      
      {/* Header and top bar actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Mine Refleksjonsnotater
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mt-1">
            Bruk feltene under til å formulere dine egne historier, eksempler og strategier. 
            Dette gjør deg rustet til å svare trygt og reflektert under intervjuet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <span className="text-xs text-slate-400 italic mr-2 bg-slate-50 border px-2.5 py-1 rounded-md">
            {saveStatus}
          </span>
          
          <button
            id="btn-print-notes"
            onClick={handlePrint}
            className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
            title="Skriv ut dine notater"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Skriv ut</span>
          </button>

          <button
            id="btn-export-pdf"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="p-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>Last ned briefing (PDF)</span>
              </>
            )}
          </button>

          <button
            id="btn-export-notes"
            onClick={handleExportTxt}
            className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
            title="Last ned notater som tekstfil"
          >
            <Download className="w-4 h-4" />
            <span>Eksporter (.txt)</span>
          </button>
        </div>
      </div>

      {/* Grid: Left navigation for 5 dimensions, Right text editor panel */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Choose dimension (4 cols) */}
        <div className="md:col-span-4 bg-white border border-slate-100 rounded-xl p-4 shadow-xs space-y-2">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider px-2 mb-3">
            Velg dimensjon
          </h3>
          
          <div className="space-y-1">
            {(Object.keys(dimensionsData) as DimensionKey[]).map((key) => {
              const name = dimensionsData[key].name;
              const isActive = activeDimKey === key;
              const band = getBandForDim(key);
              const hasNotes = !!(notes[key]?.workExample || notes[key]?.interviewStrength || notes[key]?.awareness);

              return (
                <button
                  key={key}
                  id={`btn-select-note-dim-${key}`}
                  onClick={() => setActiveDimKey(key)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-sm'
                      : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/50 text-slate-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{name}</span>
                    {band && (
                      <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-teal-300' : 'text-slate-500'}`}>
                        Din tendens: {band}
                      </span>
                    )}
                  </div>
                  
                  {hasNotes && (
                    <CheckCircle className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Three textarea fields (8 cols) */}
        <div id="notes-editor-panel" className="md:col-span-8 bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Editor Header */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Arbeidsnotater: {activeInfo.name}
              </h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              {activeInfo.description} {activeBand ? `Ditt estimerte resultat på denne egenskapen er: ${activeBand}.` : ''}
            </p>
          </div>

          {/* Field 1: Eksempel fra arbeidshverdagen */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              1. Eksempel fra arbeidshverdagen
            </label>
            <p className="text-xs text-slate-500">
              Beskriv en konkret situasjon (f.eks. ved bruk av STAR-metoden: Situasjon, Task, Action, Resultat) hvor du demonstrerte denne egenskapen på jobb.
            </p>
            <textarea
              id={`textarea-${activeDimKey}-workExample`}
              value={activeNote.workExample}
              onChange={(e) => handleTextChange(activeDimKey, 'workExample', e.target.value)}
              placeholder="F.eks. 'I mitt forrige prosjekt oppsto det en uforutsett endring i tidsfristen... Jeg gjorde da...'"
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/20"
            />
          </div>

          {/* Field 2: Styrke jeg kan forklare i intervju */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              2. Styrke jeg kan forklare i intervju
            </label>
            <p className="text-xs text-slate-500">
              Hvordan vil du presentere de positive sidene ved din tendens for en rekrutterer, uten at det høres ut som skryt?
            </p>
            <textarea
              id={`textarea-${activeDimKey}-interviewStrength`}
              value={activeNote.interviewStrength}
              onChange={(e) => handleTextChange(activeDimKey, 'interviewStrength', e.target.value)}
              placeholder="F.eks. 'Jeg er flink til å skape ro og fremdrift under tidspress fordi jeg opprettholder fokus på tall og fakta framfor stress...'"
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/20"
            />
          </div>

          {/* Field 3: Noe jeg bør være bevisst på */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              3. Noe jeg bør være bevisst på (Fallgruver / Utviklingsområder)
            </label>
            <p className="text-xs text-slate-500">
              Hvilke naturlige utfordringer kan du støte på (f.eks. perfeksjonisme hvis du er veldig planmessig), og hvordan viser du at du kompenserer for dette?
            </p>
            <textarea
              id={`textarea-${activeDimKey}-awareness`}
              value={activeNote.awareness}
              onChange={(e) => handleTextChange(activeDimKey, 'awareness', e.target.value)}
              placeholder="F.eks. 'Siden jeg liker faste rammer, kan jeg bli frustrert hvis prioriteringer endres daglig. Jeg takler det ved å...'"
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50/20"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
