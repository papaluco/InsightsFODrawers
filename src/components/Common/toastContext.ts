import { createContext, useContext } from 'react';

export type ToastTone = 'info' | 'success';

export interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/** showToast from the nearest ToastProvider (Toast.tsx). */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider.');
  return context;
}
