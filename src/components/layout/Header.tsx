import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { useSoilSense } from '../../context/SoilSenseContext';

import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentPageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentPageTitle }) => {
  const {
    latestRecord,
    lastSyncTime,
    isRefreshing,
    refreshData,
    isDemoMode,
    toggleDemoMode,
    simulateDeviceUpload,
    darkMode,
    toggleDarkMode
  } = useSoilSense();

  const timeAgoStr = latestRecord
    ? formatDistanceToNow(new Date(latestRecord.timestamp), { addSuffix: true })
    : 'No uploads yet';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white">
                {currentPageTitle}
              </h1>
              {isDemoMode && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Demo Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Upload Timestamp, Sync, Demo Simulator, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Last Upload Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-navy-800 border border-slate-200/70 dark:border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400 dark:text-slate-500">Last Cloud Upload:</span>
            <span className="font-medium text-navy-900 dark:text-slate-100" title={latestRecord?.timestamp}>
              {timeAgoStr}
            </span>
          </div>

          {/* If Demo Mode is active: Button to simulate hardware upload! */}
          {isDemoMode && (
            <button
              onClick={simulateDeviceUpload}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition-transform active:scale-95"
              title="Simulates physically holding the device button for 2 seconds to upload a new spot test"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">Simulate</span> Button Upload
            </button>
          )}

          {/* Refresh Data */}
          <button
            onClick={() => refreshData()}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors disabled:opacity-50"
            title="Fetch latest feed from ThingSpeak"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User / Org Avatar */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-navy-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              SS
            </div>
            <div className="text-left text-xs leading-tight hidden lg:block">
              <div className="font-semibold text-navy-900 dark:text-slate-100">Agronomist</div>
              <div className="text-[10px] text-slate-400">SoilSense-01</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
