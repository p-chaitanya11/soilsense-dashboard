import React from 'react';
import { Layers, RefreshCw, PlusCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'empty' | 'error' | 'sync';
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'empty',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'error':
        return <AlertCircle className="w-10 h-10 text-rose-500" />;
      case 'sync':
        return <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />;
      case 'empty':
      default:
        return <Layers className="w-10 h-10 text-slate-400 dark:text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-navy-900 border border-dashed border-slate-300 dark:border-navy-700 rounded-2xl max-w-lg mx-auto my-6">
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-navy-800 mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-navy-900 dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary" size="sm">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="outline" size="sm">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
