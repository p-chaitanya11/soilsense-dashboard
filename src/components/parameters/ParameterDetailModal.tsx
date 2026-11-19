import React, { useMemo } from 'react';
import { Modal } from '../common/Modal';
import { SoilParameterKey } from '../../types/thingspeak';
import { PARAMETER_CONFIGS, evaluateAgronomicStatus } from '../../utils/constants';
import { useSoilSense } from '../../context/SoilSenseContext';
import { calculateParameterStats, exportRecordsToCSV } from '../../services/exportService';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { format } from 'date-fns';
import { Download, Sliders, Info, Clock, CheckCircle } from 'lucide-react';

interface ParameterDetailModalProps {
  parameterKey: SoilParameterKey;
  isOpen: boolean;
  onClose: () => void;
}

export const ParameterDetailModal: React.FC<ParameterDetailModalProps> = ({
  parameterKey,
  isOpen,
  onClose
}) => {
  const { records, latestRecord, activeThresholds, darkMode, selectedCropPreset } = useSoilSense();
  const config = PARAMETER_CONFIGS[parameterKey];
  const threshold = activeThresholds[parameterKey];

  const currentValue = latestRecord ? latestRecord[parameterKey] : null;
  const isAvailable = currentValue !== null && currentValue !== undefined && !isNaN(currentValue);

  const status = isAvailable
    ? evaluateAgronomicStatus(currentValue, threshold)
    : 'unavailable';

  const stats = useMemo(() => {
    return calculateParameterStats(records, parameterKey);
  }, [records, parameterKey]);

  // Chart data: last 25 uploads
  const chartData = useMemo(() => {
    return records.slice(-25).map(r => ({
      name: format(new Date(r.timestamp), 'MM/dd HH:mm'),
      fullDate: format(new Date(r.timestamp), 'PPpp'),
      entryId: r.entryId,
      value: r[parameterKey]
    }));
  }, [records, parameterKey]);

  const gridColor = darkMode ? '#1E293B' : '#F1F5F9';
  const textColor = darkMode ? '#94A3B8' : '#64748B';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${config.label} Details & Telemetry`}
      subtitle={`ThingSpeak ${config.thingSpeakField} · ${config.description}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Latest Value Hero Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/80 dark:border-navy-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">
              Latest Uploaded Reading
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              {isAvailable ? (
                <>
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-navy-900 dark:text-white">
                    {currentValue.toFixed(config.decimals)}
                  </span>
                  <span className="text-base font-semibold text-slate-500">
                    {config.unit}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-slate-400 italic">
                  Not available
                </span>
              )}
            </div>
            {latestRecord && (
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Recorded: {format(new Date(latestRecord.timestamp), 'PPpp')}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <Badge status={status} size="md">
              Current: {status}
            </Badge>
            <span className="text-[11px] text-slate-400">
              Target Profile: {selectedCropPreset.name}
            </span>
          </div>
        </div>

        {/* Statistical Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-navy-800 bg-white dark:bg-navy-900">
            <span className="text-[11px] text-slate-400 font-medium">Minimum</span>
            <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 mt-0.5">
              {stats.min !== null ? `${stats.min} ${config.unit}` : 'N/A'}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-navy-800 bg-white dark:bg-navy-900">
            <span className="text-[11px] text-slate-400 font-medium">Maximum</span>
            <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              {stats.max !== null ? `${stats.max} ${config.unit}` : 'N/A'}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-navy-800 bg-white dark:bg-navy-900">
            <span className="text-[11px] text-slate-400 font-medium">Average Mean</span>
            <div className="text-lg font-bold font-mono text-brand-600 dark:text-brand-400 mt-0.5">
              {stats.avg !== null ? `${stats.avg} ${config.unit}` : 'N/A'}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-navy-800 bg-white dark:bg-navy-900">
            <span className="text-[11px] text-slate-400 font-medium">Valid Samples</span>
            <div className="text-lg font-bold font-mono text-navy-900 dark:text-white mt-0.5">
              {stats.count}
            </div>
          </div>
        </div>

        {/* Historical Trend Line Graphic */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Historical Upload Timeline (Recent Spot Tests)
            </h4>
            <span className="text-[11px] text-slate-400">Unit: {config.unit}</span>
          </div>

          <div className="h-60 w-full bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200/70 dark:border-navy-800 rounded-xl p-3">
            {chartData.length === 0 || !isAvailable ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No historical telemetry points available for this parameter.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: textColor }} />
                  <YAxis tick={{ fontSize: 10, fill: textColor }} domain={['auto', 'auto']} />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-2.5 rounded-lg shadow-md text-xs">
                            <div className="font-bold text-navy-900 dark:text-white">
                              Entry #{pt.entryId}
                            </div>
                            <div className="text-[10px] text-slate-400">{pt.fullDate}</div>
                            <div className="mt-1 font-mono font-bold text-brand-600 dark:text-brand-400">
                              {pt.value} {config.unit}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={config.label}
                    stroke={config.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: config.color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User-Defined Agronomic Threshold Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-navy-900 dark:text-white">
            <Info className="w-4 h-4 text-brand-600" />
            <span>Configurable User-Defined Agronomic Range</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            Target optimal window for {config.label} is currently set to{' '}
            <strong className="text-navy-900 dark:text-white font-mono">
              {threshold.minOptimal} – {threshold.maxOptimal} {config.unit}
            </strong>
            . Note: Universal agronomic thresholds do not exist; guidelines vary according to crop growth stage, soil texture (clay vs sandy loam), and regional climate. You can customize these thresholds in Settings.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800">
          <Button
            onClick={() => exportRecordsToCSV(records, `soilsense-${parameterKey}`)}
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export All Records
          </Button>

          <Button onClick={onClose} variant="secondary" size="sm">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
