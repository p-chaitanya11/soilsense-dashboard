import React, { useState, useMemo } from 'react';
import { useSoilSense } from '../context/SoilSenseContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Brush
} from 'recharts';
import { format, subDays, subHours, isAfter, isBefore } from 'date-fns';
import { PARAMETER_CONFIGS } from '../utils/constants';
import { SoilParameterKey, SoilMeasurementRecord } from '../types/thingspeak';
import { exportRecordsToCSV, calculateParameterStats } from '../services/exportService';
import {
  Calendar,
  Download,
  Filter,
  BarChart2,
  Layers,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type TimeFilter = '24h' | '7d' | '30d' | 'all' | 'custom';

export const AnalyticsPage: React.FC = () => {
  const { records, darkMode } = useSoilSense();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const [selectedParam, setSelectedParam] = useState<SoilParameterKey | 'compare' | 'npk'>('moisture');
  const [compareParam1, setCompareParam1] = useState<SoilParameterKey>('moisture');
  const [compareParam2, setCompareParam2] = useState<SoilParameterKey>('ec');

  // Filter records based on selected time window
  const filteredRecords = useMemo(() => {
    if (records.length === 0) return [];
    const now = new Date();

    if (timeFilter === '24h') {
      const cutoff = subHours(now, 24);
      return records.filter(r => isAfter(new Date(r.timestamp), cutoff));
    } else if (timeFilter === '7d') {
      const cutoff = subDays(now, 7);
      return records.filter(r => isAfter(new Date(r.timestamp), cutoff));
    } else if (timeFilter === '30d') {
      const cutoff = subDays(now, 30);
      return records.filter(r => isAfter(new Date(r.timestamp), cutoff));
    } else if (timeFilter === 'custom') {
      let filtered = [...records];
      if (customStart) {
        const start = new Date(customStart);
        filtered = filtered.filter(r => isAfter(new Date(r.timestamp), start));
      }
      if (customEnd) {
        const end = new Date(customEnd);
        filtered = filtered.filter(r => isBefore(new Date(r.timestamp), end));
      }
      return filtered;
    }
    return records;
  }, [records, timeFilter, customStart, customEnd]);

  // Prepared chart data
  const chartData = useMemo(() => {
    return filteredRecords.map(r => ({
      name: format(new Date(r.timestamp), 'MM/dd HH:mm'),
      fullDate: format(new Date(r.timestamp), 'PPpp'),
      entryId: r.entryId,
      moisture: r.moisture,
      temperature: r.temperature,
      pH: r.pH,
      ec: r.ec,
      nitrogen: r.nitrogen,
      phosphorus: r.phosphorus,
      potassium: r.potassium,
      batteryVoltage: r.batteryVoltage
    }));
  }, [filteredRecords]);

  // Statistics for selected parameter
  const activeStats = useMemo(() => {
    if (selectedParam === 'compare' || selectedParam === 'npk') {
      return calculateParameterStats(filteredRecords, 'moisture');
    }
    return calculateParameterStats(filteredRecords, selectedParam);
  }, [filteredRecords, selectedParam]);

  const gridColor = darkMode ? '#1E293B' : '#F1F5F9';
  const textColor = darkMode ? '#94A3B8' : '#64748B';

  // Check if NPK data exists in this dataset
  const hasValidNPK = useMemo(() => {
    return filteredRecords.some(r => r.nitrogen !== null || r.phosphorus !== null || r.potassium !== null);
  }, [filteredRecords]);

  const CustomAnalyticsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-navy-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-1 flex justify-between">
            <span>Entry #{dataPoint.entryId}</span>
            <span className="text-slate-400 font-normal">{dataPoint.fullDate}</span>
          </div>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex justify-between items-center gap-2">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-navy-900 dark:text-slate-200">
                {entry.value !== null && entry.value !== undefined ? entry.value : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Export Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Time range filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" /> Time Window:
            </span>
            {(['24h', '7d', '30d', 'all', 'custom'] as TimeFilter[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === tf
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tf === '24h' && 'Last 24 Hours'}
                {tf === '7d' && 'Last 7 Days'}
                {tf === '30d' && 'Last 30 Days'}
                {tf === 'all' && 'All History'}
                {tf === 'custom' && 'Custom Range'}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              onClick={() => exportRecordsToCSV(filteredRecords, 'soilsense-analytics')}
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV ({filteredRecords.length})
            </Button>
          </div>
        </div>

        {/* Custom date range inputs */}
        {timeFilter === 'custom' && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">From:</span>
              <input
                type="datetime-local"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">To:</span>
              <input
                type="datetime-local"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 text-xs"
              />
            </div>
            <span className="text-slate-400 text-[11px]">
              Showing {filteredRecords.length} of {records.length} total test records
            </span>
          </div>
        )}
      </Card>

      {/* Parameter Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'moisture', label: 'Soil Moisture (%)' },
          { id: 'temperature', label: 'Soil Temperature (°C)' },
          { id: 'pH', label: 'Soil pH' },
          { id: 'ec', label: 'Electrical Conductivity (µS/cm)' },
          { id: 'npk', label: 'Macronutrients (N-P-K)' },
          { id: 'compare', label: 'Dual-Parameter Comparison' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedParam(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-medium shrink-0 transition-all ${
              selectedParam === tab.id
                ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-xs border border-brand-200/60 dark:border-navy-700 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-navy-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <Card className="p-6">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">
              {selectedParam === 'compare'
                ? `Cross-Correlation: ${PARAMETER_CONFIGS[compareParam1].label} vs ${PARAMETER_CONFIGS[compareParam2].label}`
                : selectedParam === 'npk'
                ? 'Soil Macronutrients (N, P, K) Time Series'
                : `${PARAMETER_CONFIGS[selectedParam].label} vs Time`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive timeline reflecting manual spot sample uploads across the selected window
            </p>
          </div>

          {/* If Dual comparison is active: select parameters */}
          {selectedParam === 'compare' && (
            <div className="flex items-center gap-2 text-xs">
              <select
                value={compareParam1}
                onChange={e => setCompareParam1(e.target.value as SoilParameterKey)}
                className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200"
              >
                <option value="moisture">Soil Moisture (%)</option>
                <option value="temperature">Temperature (°C)</option>
                <option value="pH">Soil pH</option>
                <option value="ec">EC (µS/cm)</option>
              </select>
              <span className="text-slate-400">vs</span>
              <select
                value={compareParam2}
                onChange={e => setCompareParam2(e.target.value as SoilParameterKey)}
                className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200"
              >
                <option value="ec">EC (µS/cm)</option>
                <option value="moisture">Soil Moisture (%)</option>
                <option value="temperature">Temperature (°C)</option>
                <option value="pH">Soil pH</option>
              </select>
            </div>
          )}
        </div>

        {/* NPK Missing Warning Banner if NPK tab is selected but data is absent */}
        {selectedParam === 'npk' && !hasValidNPK && (
          <div className="p-4 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <span className="font-semibold">NPK Sensor Channels Not Populated:</span>
              <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                The current physical probe is operating as a 4-in-1 or 5-in-1 sensor variant (Moisture, Temp, pH, EC).
                To chart Nitrogen, Phosphorus, and Potassium, connect the 7-in-1 JXBS-3001-TR probe variant.
              </p>
            </div>
          </div>
        )}

        {/* The Recharts Graphic */}
        <div className="h-96 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              No historical data for the selected time filter.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {selectedParam === 'compare' ? (
                /* Dual Axis Comparison Chart */
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: PARAMETER_CONFIGS[compareParam1].color }}
                    orientation="left"
                  />
                  <YAxis
                    yAxisId="right"
                    tick={{ fontSize: 11, fill: PARAMETER_CONFIGS[compareParam2].color }}
                    orientation="right"
                  />
                  <Tooltip content={<CustomAnalyticsTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey={compareParam1}
                    name={`${PARAMETER_CONFIGS[compareParam1].label} (${PARAMETER_CONFIGS[compareParam1].unit})`}
                    stroke={PARAMETER_CONFIGS[compareParam1].color}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={compareParam2}
                    name={`${PARAMETER_CONFIGS[compareParam2].label} (${PARAMETER_CONFIGS[compareParam2].unit})`}
                    stroke={PARAMETER_CONFIGS[compareParam2].color}
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                  />
                  <Brush dataKey="name" height={25} stroke="#16A34A" fill={darkMode ? '#0F172A' : '#F8FAFC'} />
                </LineChart>
              ) : selectedParam === 'npk' ? (
                /* N-P-K Multi-Line Chart */
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} />
                  <YAxis tick={{ fontSize: 11, fill: textColor }} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomAnalyticsTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="nitrogen"
                    name="Nitrogen (mg/kg)"
                    stroke={PARAMETER_CONFIGS.nitrogen.color}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="phosphorus"
                    name="Phosphorus (mg/kg)"
                    stroke={PARAMETER_CONFIGS.phosphorus.color}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="potassium"
                    name="Potassium (mg/kg)"
                    stroke={PARAMETER_CONFIGS.potassium.color}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Brush dataKey="name" height={25} stroke="#16A34A" fill={darkMode ? '#0F172A' : '#F8FAFC'} />
                </LineChart>
              ) : (
                /* Single Parameter Area/Line Chart with gradient */
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id={`grad-${selectedParam}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PARAMETER_CONFIGS[selectedParam].color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={PARAMETER_CONFIGS[selectedParam].color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} />
                  <YAxis tick={{ fontSize: 11, fill: textColor }} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomAnalyticsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={selectedParam}
                    name={`${PARAMETER_CONFIGS[selectedParam].label} (${PARAMETER_CONFIGS[selectedParam].unit})`}
                    stroke={PARAMETER_CONFIGS[selectedParam].color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#grad-${selectedParam})`}
                    dot={{ r: 3, fill: PARAMETER_CONFIGS[selectedParam].color }}
                    activeDot={{ r: 6 }}
                  />
                  <Brush dataKey="name" height={25} stroke="#16A34A" fill={darkMode ? '#0F172A' : '#F8FAFC'} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Statistical Distribution Summary Strip */}
      {selectedParam !== 'compare' && selectedParam !== 'npk' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Valid Samples
            </span>
            <div className="text-xl font-bold font-mono text-navy-900 dark:text-white mt-1">
              {activeStats.count}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">In current filter</p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Minimum Reading
            </span>
            <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
              {activeStats.min !== null ? `${activeStats.min} ${PARAMETER_CONFIGS[selectedParam].unit}` : 'N/A'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Lowest recorded</p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Maximum Reading
            </span>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {activeStats.max !== null ? `${activeStats.max} ${PARAMETER_CONFIGS[selectedParam].unit}` : 'N/A'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Peak measurement</p>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Mean Average
            </span>
            <div className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
              {activeStats.avg !== null ? `${activeStats.avg} ${PARAMETER_CONFIGS[selectedParam].unit}` : 'N/A'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Statistical mean</p>
          </Card>

          <Card className="p-4 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Std. Deviation (σ)
            </span>
            <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 mt-1">
              {activeStats.stdDev !== null ? `±${activeStats.stdDev}` : 'N/A'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Dispersion metric</p>
          </Card>
        </div>
      )}
    </div>
  );
};
