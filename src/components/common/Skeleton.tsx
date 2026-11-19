import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-navy-800 rounded-md ${className}`}
    />
  );
};

export const KpiCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="flex items-baseline gap-2 pt-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-5 w-10" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};
