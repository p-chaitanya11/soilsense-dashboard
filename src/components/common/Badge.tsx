import React from 'react';
import { AgronomicStatus } from '../../types/thingspeak';

interface BadgeProps {
  status?: AgronomicStatus | 'info' | 'success' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'neutral',
  children,
  size = 'md',
  className = ''
}) => {
  const getColors = () => {
    switch (status) {
      case 'optimal':
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'low':
      case 'high':
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50';
      case 'critical-low':
      case 'critical-high':
      case 'error':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50';
      case 'info':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/50';
      case 'unavailable':
      case 'neutral':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-navy-800 dark:text-slate-400 dark:border-navy-700';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${getColors()} font-medium tracking-wide transition-colors ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {children}
    </span>
  );
};
