import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Info, X } from 'lucide-react';
import { ToastContext, ToastTone } from './toastContext';

/**
 * Minimal toast. The app has no toast provider (App.tsx notes the ToastContainer is missing);
 * this matches the look of CSVFullExpButton's demo toast (white card, colored left border,
 * bottom-right) without its manual DOM injection. Production can swap in its own provider.
 */

interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

const AUTO_DISMISS_MS = 4000;

const TONE_STYLES: Record<ToastTone, { border: string; iconTile: string; icon: React.ReactNode }> = {
  info: { border: 'border-indigo-500', iconTile: 'bg-indigo-50', icon: <Info size={18} className="text-indigo-600" /> },
  success: { border: 'border-emerald-500', iconTile: 'bg-emerald-50', icon: <CheckCircle size={18} className="text-emerald-600" /> },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    clearTimeout(timerRef.current);
    // A new id restarts the entry transition when the same message is shown twice.
    setToast({ id: Date.now(), message, tone });
    timerRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        // Above the overlay (z-50), Site Drivers (z-[55]) and Schoolie (z-[60]).
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-[70] pointer-events-none">
          {toast && <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  // tailwindcss-animate isn't installed, so slide in with a plain transition (spec §12).
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const style = TONE_STYLES[toast.tone];

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 min-w-[280px] max-w-sm bg-white border-l-4 ${style.border} shadow-2xl rounded-r p-4 transition-all duration-300 ${
        entered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <div className={`p-2 rounded-full shrink-0 ${style.iconTile}`}>{style.icon}</div>
      <p className="flex-1 text-sm font-semibold text-slate-800">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};
