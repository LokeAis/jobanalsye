import React, { useState, useRef, useEffect } from 'react';
import { statements, DimensionKey } from '../data/statements';
import { MessageSquare, Send, RefreshCw, Lock, ArrowRight, Bot, User, ShieldAlert, Sparkles } from 'lucide-react';
import { usePremium } from '../premium/PremiumContext';
import PremiumLock from '../premium/PremiumLock';

interface InterviewSimulatorProps {
  answers: Record<string, number>;
  onNavigateToTab: (tabId: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function InterviewSimulator({ answers, onNavigateToTab }: InterviewSimulatorProps) {
  const { isPremium } = usePremium();

  const totalStatementsCount = statements.length;
  const answeredCount = statements.filter((s) => answers[s.id] !== undefined).length;
  const isCompleted = answeredCount === totalStatementsCount;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Compute Big Five dimension scores for context.
  const getDimensionScores = (): Record<string, { score: number; band: string }> => {
    const keys: DimensionKey[] = ['planmessighet', 'emosjonell_stabilitet', 'ekstroversjon', 'omgjengelighet', 'aapenhet'];
    const result: Record<string, { score: number; band: string }> = {};
    keys.forEach((dim) => {
      const dimStatements = statements.filter((s) => s.dimensjon === dim);
      let sum = 0;
      dimStatements.forEach((s) => {
        const ans = answers[s.id] || 3;
        sum += s.keyed === 'negativ' ? 6 - ans : ans;
      });
      const score = sum / dimStatements.length;
      const band = score <= 2.6 ? 'Lav' : score >= 3.7 ? 'Høy' : 'Moderat';
      result[dim] = { score, band };
    });
    return result;
  };

  const sendTurn = async (nextMessages: ChatMessage[]) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch('/api/interview-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: localStorage.getItem('bigfive_prep_job_title') || '',
          jobDescription: localStorage.getItem('bigfive_prep_job_desc') || '',
          dimensionScores: getDimensionScores(),
          messages: nextMessages,
        }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Serveren returnerte en feil.');

      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setError(typeof err?.message === 'string' && err.message.trim() ? err.message : 'Noe gikk galt. Prøv igjen.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setMessages([]);
    sendTurn([]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    sendTurn([...messages, { role: 'user', content: text }]);
  };

  const handleRestart = () => {
    setMessages([]);
    setStarted(false);
    setError(null);
    setInput('');
  };

  // Gate 1: premium.
  if (!isPremium) {
    return (
      <PremiumLock
        title="Intervju-simulator"
        description="Øv på et realistisk jobbintervju i sanntid. En AI-rekrutterer stiller deg oppfølgingsspørsmål basert på din Big Five-profil og stillingen du forbereder deg til."
        benefits={[
          'Realistiske, tilpassede intervjuspørsmål',
          'Naturlige oppfølgingsspørsmål basert på svarene dine',
          'Kort, konstruktiv tilbakemelding underveis',
        ]}
      />
    );
  }

  // Gate 2: questionnaire must be completed.
  if (!isCompleted) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-slate-200/60 rounded-xl p-8 shadow-xs">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Fullfør testen først</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Simulatoren bruker din Big Five-profil for å skreddersy intervjuet. Fullfør de 60 påstandene for å låse den opp.
          </p>
          <button
            onClick={() => onNavigateToTab('questionnaire')}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            Fullfør spørreskjemaet ({answeredCount}/60)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-amber-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Premium · Intervju-simulator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Øv på intervjuet i sanntid</h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          En AI-rekrutterer intervjuer deg basert på din profil og stillingen din. Svar så ærlig og konkret du kan — akkurat som i et ekte intervju.
        </p>
      </div>

      {!started ? (
        <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mx-auto">
            <Bot className="w-7 h-7" />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
            Rekruttereren tar utgangspunkt i jobben du la inn under «AI Jobbanalyse» (hvis noen). Klar?
          </p>
          <button
            onClick={handleStart}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-6 rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Start intervjuet
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs flex flex-col" style={{ height: '70vh' }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-teal-700 text-white'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-slate-100 text-slate-800 rounded-tr-sm'
                      : 'bg-teal-50 text-slate-800 border border-teal-100/50 rounded-tl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3" role="status" aria-live="polite">
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-teal-50 border border-teal-100/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-950 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-100 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Skriv svaret ditt..."
                disabled={loading}
                className="flex-1 resize-none border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition cursor-pointer shrink-0"
                title="Send svar"
                aria-label="Send svar"
              >
                <Send className="w-5 h-5" />
              </button>
              <button
                onClick={handleRestart}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-2.5 rounded-lg transition cursor-pointer shrink-0"
                title="Start på nytt"
                aria-label="Start intervjuet på nytt"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 px-1">
              Trykk Enter for å sende · Shift+Enter for ny linje. Samtalen lagres ikke.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
