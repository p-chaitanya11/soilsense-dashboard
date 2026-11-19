import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useSoilSense } from '../../context/SoilSenseContext';
import { Card } from '../common/Card';
import { format } from 'date-fns';
import { PARAMETER_CONFIGS } from '../../utils/constants';

export const QuickTrendChart: React.FC = () => {
  const { records, darkMode } = useSoilSense();
  const [activeParameter, setActiveParameter] = useState<'all' | 'moisture' | 'temperature' | 'pH' | 'ec'>('all');

  // Take the last 20 records for clean visualization
  const chartData = records.slice(-20).map(r => ({
    name: format(new Date(r.timestamp), 'HH:mm'),
    fullDate: format(new Date(r.timestamp), 'MMM dd, HH:mm:ss'),
    entryId: r.entryId,
    moisture: r.moisture,
    temperature: r.temperature,
    pH: r.pH,
    ec: r.ec
  }));

  const gridColor = darkMode ? '#1E293B' : '#F1F5F9';
  const textColor = darkMode ? '#94A3B8' : '#64748B';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[180px]">
          <div className="font-semibold text-navy-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-1 flex justify-between">
            <span>Entry #{dataPoint.entryId}</span>
            <span className="text-slate-400 font-normal">{dataPoint.fullDate}</span>
          </div>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex justify-between items-center gap-2">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
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
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            Recent Telemetry Trend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological trend across recent manual spot tests (ThingSpeak feeds)
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-navy-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveParameter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeParameter === 'all'
                ? 'bg-white dark:bg-navy-900 text-brand-700 dark:text-brand-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            Moisture & Temp
          </button>
          <button
            onClick={() => setActiveParameter('pH')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeParameter === 'pH'
                ? 'bg-white dark:bg-navy-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            Soil pH
          </button>
          <button
            onClick={() => setActiveParameter('ec')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeParameter === 'ec'
                ? 'bg-white dark:bg-navy-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            Salinity (EC)
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            No historical records retrieved yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                iconType="circle"
              />

              {(activeParameter === 'all' || activeParameter === 'moisture') && (
                <Line
                  type="monotone"
                  dataKey="moisture"
                  name="Moisture (%)"
                  stroke={PARAMETER_CONFIGS.moisture.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: PARAMETER_CONFIGS.moisture.color }}
                  activeDot={{ r: 5 }}
                />
              )}

              {(activeParameter === 'all' || activeParameter === 'temperature') && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temp (°C)"
                  stroke={PARAMETER_CONFIGS.temperature.color}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: PARAMETER_CONFIGS.temperature.color }}
                  activeDot={{ r: 5 }}
                />
              )}

              {activeParameter === 'pH' && (
                <Line
                  type="monotone"
                  dataKey="pH"
                  name="Soil pH"
                  stroke={PARAMETER_CONFIGS.pH.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: PARAMETER_CONFIGS.pH.color }}
                  activeDot={{ r: 6 }}
                />
              )}

              {activeParameter === 'ec' && (
                <Line
                  type="monotone"
                  dataKey="ec"
                  name="EC (µS/cm)"
                  stroke={PARAMETER_CONFIGS.ec.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: PARAMETER_CONFIGS.ec.color }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
