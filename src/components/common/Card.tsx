import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-xl shadow-xs transition-all duration-200 ${
        hoverable || onClick
          ? 'cursor-pointer hover:border-brand-500/50 hover:shadow-md dark:hover:border-brand-500/40 hover:-translate-y-0.5'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
