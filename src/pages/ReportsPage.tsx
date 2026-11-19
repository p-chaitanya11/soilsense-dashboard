import React, { useState, useMemo } from 'react';
import { useSoilSense } from '../context/SoilSenseContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { exportRecordsToCSV, calculateParameterStats } from '../services/exportService';
import { DEFAULT_DEVICE_METADATA, PARAMETER_CONFIGS } from '../utils/constants';
import { format, subDays, isAfter } from 'date-fns';
import {
  Printer,
  Download,
  FileText,
  Calendar,
  CheckCircle2,
  Building,
  User,
  Leaf,
  Layers
} from 'lucide-react';
import { SoilParameterKey } from '../types/thingspeak';

export const ReportsPage: React.FC = () => {
  const { records, channelId, channelTitle, selectedCropPreset } = useSoilSense();

  const [reportTitle, setReportTitle] = useState('Soil Health Field Inspection Report');
  const [operatorName, setOperatorName] = useState('Field Agronomist');
  const [plotName, setPlotName] = useState('Greenhouse Sector A - Plot #4');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Filter records
  const filteredRecords = useMemo(() => {
    if (records.length === 0) return [];
    if (dateRange === 'all') return records;
    const days = dateRange === '7d' ? 7 : 30;
    const cutoff = subDays(new Date(), days);
    return records.filter(r => isAfter(new Date(r.timestamp), cutoff));
  }, [records, dateRange]);

  // Compute summary stats for all parameters
  const statsSummary = useMemo(() => {
    const keys: SoilParameterKey[] = [
      'moisture',
      'temperature',
      'pH',
      'ec',
      'nitrogen',
      'phosphorus',
      'potassium',
      'batteryVoltage'
    ];
    return keys.map(key => ({
      key,
      config: PARAMETER_CONFIGS[key],
      stats: calculateParameterStats(filteredRecords, key)
    }));
  }, [filteredRecords]);

  const handlePrint = () => {
    window.print();
  };

  const earliestDate = filteredRecords.length > 0 ? new Date(filteredRecords[0].timestamp) : new Date();
  const latestDate = filteredRecords.length > 0 ? new Date(filteredRecords[filteredRecords.length - 1].timestamp) : new Date();

  return (
    <div className="space-y-6">
      {/* Controls Card (Hidden during print) */}
      <Card className="p-5 no-print">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              Generate Agricultural Soil Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize report parameters, preview the formal document, and print or export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => exportRecordsToCSV(filteredRecords, 'soilsense-report-data')}
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export Raw CSV
            </Button>
            <Button
              onClick={handlePrint}
              variant="primary"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
            >
              Print / Save as PDF
            </Button>
          </div>
        </div>

        {/* Input parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-navy-800 text-xs">
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Report Title:</label>
            <input
              type="text"
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1.5 text-navy-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Plot / Zone Name:</label>
            <input
              type="text"
              value={plotName}
              onChange={e => setPlotName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1.5 text-navy-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Operator / Agronomist:</label>
            <input
              type="text"
              value={operatorName}
              onChange={e => setOperatorName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1.5 text-navy-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Time Window:</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1.5 text-navy-900 dark:text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Available Records</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Formal Printable Document View */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 sm:p-10 shadow-sm text-navy-900 dark:text-slate-100 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-brand-600 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl">
              <Leaf className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-navy-900 dark:text-white">
                SoilSense
              </h1>
              <p className="text-xs uppercase font-semibold tracking-wider text-slate-500">
                Precision Agricultural IoT Diagnostics
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div><strong>Report Ref:</strong> SS-RPT-{format(new Date(), 'yyyyMMdd-HHmm')}</div>
            <div><strong>Generated:</strong> {format(new Date(), 'PPpp')}</div>
            <div><strong>Target Crop:</strong> {selectedCropPreset.name}</div>
          </div>
        </div>

        {/* Report Metadata Details Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700 text-xs mb-8">
          <div>
            <span className="text-slate-400 block font-medium">Field / Plot:</span>
            <span className="font-bold text-navy-900 dark:text-white">{plotName}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Hardware Unit:</span>
            <span className="font-bold text-navy-900 dark:text-white">{DEFAULT_DEVICE_METADATA.name} (ESP8266)</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Cloud Channel:</span>
            <span className="font-mono text-navy-900 dark:text-white">ID {channelId || 'Demo'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Tested Samples:</span>
            <span className="font-bold text-navy-900 dark:text-white">{filteredRecords.length} spot tests</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-navy-900 dark:text-white mb-2 pb-1 border-b border-slate-100 dark:border-navy-800">
            Executive Telemetry Summary
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This document consolidates soil health measurements collected by the portable <strong>SoilSense-01</strong> field probe via <strong>RS485 Modbus RTU</strong>.
            Readings were transferred directly to the ThingSpeak Cloud infrastructure using manual push-button triggers.
            Testing window spans from <strong>{format(earliestDate, 'PP')}</strong> to <strong>{format(latestDate, 'PP')}</strong>.
          </p>
        </div>

        {/* Statistical Summary Table */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-navy-900 dark:text-white mb-3">
            Parameter Distribution & Statistical Indices
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-navy-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Soil Parameter</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Valid Tests</th>
                  <th className="py-2.5 px-3">Min</th>
                  <th className="py-2.5 px-3">Max</th>
                  <th className="py-2.5 px-3">Mean Avg</th>
                  <th className="py-2.5 px-3">Std. Dev (σ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 font-mono">
                {statsSummary.map(item => (
                  <tr key={item.key} className="hover:bg-slate-50 dark:hover:bg-navy-800/40">
                    <td className="py-2 px-3 font-sans font-medium text-navy-900 dark:text-white">
                      {item.config.label}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {item.config.thingSpeakField}
                    </td>
                    <td className="py-2 px-3">{item.stats.count}</td>
                    <td className="py-2 px-3 text-sky-600">
                      {item.stats.min !== null ? `${item.stats.min} ${item.config.unit}` : 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-rose-600">
                      {item.stats.max !== null ? `${item.stats.max} ${item.config.unit}` : 'N/A'}
                    </td>
                    <td className="py-2 px-3 font-bold text-brand-600">
                      {item.stats.avg !== null ? `${item.stats.avg} ${item.config.unit}` : 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {item.stats.stdDev !== null ? `±${item.stats.stdDev}` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signoff Footer */}
        <div className="pt-8 border-t border-slate-200 dark:border-navy-800 flex justify-between items-end text-xs text-slate-500">
          <div>
            <div className="font-semibold text-navy-900 dark:text-white">{operatorName}</div>
            <div>Agronomy Operations Specialist</div>
            <div className="text-[10px] text-slate-400 mt-0.5">SoilSense Diagnostic Framework</div>
          </div>
          <div className="text-right">
            <div className="border-b border-slate-300 dark:border-navy-700 w-36 mb-1"></div>
            <div className="text-[10px] uppercase font-semibold">Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
};
