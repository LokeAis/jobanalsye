import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';

/**
 * App-wide feedback: toasts and a promise-based confirm dialog. Replaces the
 * native alert()/confirm() so messaging matches the app's visual design and is
 * accessible (aria-live for toasts, focus-managed modal for confirm).
 */

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface FeedbackContextValue {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setPending(options);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = (ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setPending(null);
  };

  // Stable cancel for the dialog a11y hook (Escape / backdrop / focus return).
  const cancel = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setPending(null);
  }, []);
  const confirmDialogRef = useDialog<HTMLDivElement>(!!pending, cancel);

  const toastStyles: Record<ToastType, string> = {
    success: 'bg-white border-emerald-200 text-emerald-950',
    error: 'bg-white border-rose-200 text-rose-950',
    info: 'bg-white border-slate-200 text-slate-800',
  };
  const toastIcon: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-slate-500 shrink-0" />,
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm print:hidden"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2.5 border rounded-xl shadow-lg px-4 py-3 text-sm animate-fade-in ${toastStyles[t.type]}`}
          >
            {toastIcon[t.type]}
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Lukk varsel"
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {pending && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={cancel}
        >
          <div
            ref={confirmDialogRef}
            tabIndex={-1}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  pending.danger ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 id="confirm-title" className="font-bold text-slate-900 text-base">
                  {pending.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{pending.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={cancel}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition cursor-pointer"
              >
                {pending.cancelLabel || 'Avbryt'}
              </button>
              <button
                data-autofocus
                onClick={() => settle(true)}
                className={`text-white font-semibold px-4 py-2 rounded-lg text-sm transition cursor-pointer ${
                  pending.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-700 hover:bg-teal-800'
                }`}
              >
                {pending.confirmLabel || 'Bekreft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within a FeedbackProvider');
  return ctx;
}
