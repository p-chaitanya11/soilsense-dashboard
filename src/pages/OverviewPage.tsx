import React from 'react';
import { HardwareSummaryStrip } from '../components/overview/HardwareSummaryStrip';
import { KpiGrid } from '../components/overview/KpiGrid';
import { QuickTrendChart } from '../components/overview/QuickTrendChart';
import { AgronomicHealthGauge } from '../components/overview/AgronomicHealthGauge';
import { RecentUploadsTable } from '../components/overview/RecentUploadsTable';
import { NavPage } from '../components/layout/Sidebar';
import { useSoilSense } from '../context/SoilSenseContext';
import { EmptyState } from '../components/common/EmptyState';

interface OverviewPageProps {
  onNavigate: (page: NavPage) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const { records, error, isLoading, refreshData, toggleDemoMode } = useSoilSense();

  if (error && records.length === 0) {
    return (
      <EmptyState
        title="Unable to Reach ThingSpeak Channel"
        description={error}
        icon="error"
        actionLabel="Switch to Demo Mode"
        onAction={() => toggleDemoMode(true)}
        secondaryActionLabel="Open Settings"
        onSecondaryAction={() => onNavigate('settings')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Hardware & Comm Summary Strip */}
      <HardwareSummaryStrip />

      {/* 8 KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Latest Uploaded Soil Parameters
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Click any parameter card to inspect trends & thresholds
          </span>
        </div>
        <KpiGrid />
      </div>

      {/* Primary Visual Row: Trend Chart & Health Balance Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickTrendChart />
        </div>
        <div>
          <AgronomicHealthGauge onConfigureThresholds={() => onNavigate('settings')} />
        </div>
      </div>

      {/* Recent Uploads Table */}
      <RecentUploadsTable onViewAll={() => onNavigate('records')} />
    </div>
  );
};
