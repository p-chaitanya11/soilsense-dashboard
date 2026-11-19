import React from 'react';
import { useSoilSense } from '../../context/SoilSenseContext';
import {
  Cpu,
  WifiOff,
  Battery,
  Database,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { DEFAULT_DEVICE_METADATA } from '../../utils/constants';
import { format } from 'date-fns';

export const HardwareSummaryStrip: React.FC = () => {
  const { latestRecord, records, lastSyncTime, isDemoMode } = useSoilSense();

  const uploadTimestamp = latestRecord ? new Date(latestRecord.timestamp) : null;
  const batteryPct = latestRecord?.batteryPercent ?? 75;
  const batteryVolt = latestRecord?.batteryVoltage ?? 11.4;

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-navy-800">
        {/* Device Node & Architecture */}
        <div className="flex items-center gap-3.5 pt-3 sm:pt-0">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/40 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Field Probe Unit
            </span>
            <div className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
              <span>{DEFAULT_DEVICE_METADATA.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Device configured and active"></span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ESP8266 + RS485 Modbus
            </p>
          </div>
        </div>

        {/* Cloud Upload Protocol & Link Status */}
        <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Hardware Comm State
            </span>
            <div className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
              <span>Wi-Fi Standby</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400" title="Radio activates only on 2s button hold">
              Push-to-Cloud (Battery Saver)
            </p>
          </div>
        </div>

        {/* Total Spot Tests / Records */}
        <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Cloud Testing History
            </span>
            <div className="text-sm font-bold text-navy-900 dark:text-white">
              {records.length} Recorded Tests
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ThingSpeak Feeds Archive
            </p>
          </div>
        </div>

        {/* 3S Li-ion Battery Telemetry */}
        <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">
            <Battery className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              3S Li-ion Battery Pack
            </span>
            <div className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
              <span>
                {latestRecord?.batteryVoltage !== null && latestRecord?.batteryVoltage !== undefined
                  ? `${latestRecord.batteryVoltage}V`
                  : '11.1V Nom.'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ({batteryPct}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              2000mAh (~180 uploads)
            </p>
          </div>
        </div>
      </div>

      {/* Secondary timestamp details banner */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Latest Upload Record:</span>
          <span className="font-mono font-medium text-navy-900 dark:text-slate-200">
            {uploadTimestamp ? format(uploadTimestamp, 'PPpp') : 'No records stored'}
          </span>
          {latestRecord && (
            <span className="bg-slate-100 dark:bg-navy-800 px-1.5 py-0.5 rounded font-mono text-[10px]">
              Entry #{latestRecord.entryId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dual SSID Fallback: FarmHQ / Hotspot</span>
          </span>
          <span>•</span>
          <span>ThingSpeak REST API v1</span>
        </div>
      </div>
    </div>
  );
};
