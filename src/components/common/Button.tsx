import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const variantClasses = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs focus:ring-brand-500 border border-brand-700/20',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-navy-800 dark:hover:bg-navy-700 dark:text-slate-100 border border-slate-200/60 dark:border-navy-700 focus:ring-slate-400',
    outline: 'bg-transparent border border-slate-300 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 focus:ring-brand-500',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 focus:ring-brand-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500'
  }[variant];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  }[size];

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
