import React, { useState } from 'react';
import { Info, Radio, Zap, ChevronRight, X } from 'lucide-react';

interface NoticeBannerProps {
  onLearnMore?: () => void;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ onLearnMore }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-navy-900 dark:to-sky-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-3.5 sm:p-4 mb-6 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                Manual Push-to-Cloud Telemetry
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Intermittent Wi-Fi (Battery Saver)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
              Measurements are uploaded to the cloud only when the physical device's push button is pressed (held ~2 seconds).
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
              The ESP8266 displays continuous real-time readings locally on its 0.96″ OLED, but sleeps Wi-Fi radio until triggered to maximize battery longevity in the field.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-0.5 px-2 py-1 rounded-md hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <span>Hardware Architecture</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
