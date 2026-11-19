import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  durationMs = 4500
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
      border: 'border-emerald-300 dark:border-emerald-800',
      bg: 'bg-white dark:bg-navy-900',
      text: 'text-emerald-900 dark:text-emerald-100'
    },
    info: {
      icon: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
      border: 'border-sky-300 dark:border-sky-800',
      bg: 'bg-white dark:bg-navy-900',
      text: 'text-navy-900 dark:text-navy-100'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      border: 'border-amber-300 dark:border-amber-800',
      bg: 'bg-white dark:bg-navy-900',
      text: 'text-amber-900 dark:text-amber-100'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
      border: 'border-rose-300 dark:border-rose-800',
      bg: 'bg-white dark:bg-navy-900',
      text: 'text-rose-900 dark:text-rose-100'
    }
  }[type];

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-md">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl ${config.border} ${config.bg} ${config.text}`}
      >
        {config.icon}
        <div className="text-sm font-medium pr-2">{message}</div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
