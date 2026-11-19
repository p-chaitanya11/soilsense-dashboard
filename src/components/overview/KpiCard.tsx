import React from 'react';
import {
  Droplets,
  Thermometer,
  TestTube,
  Zap,
  Sprout,
  Flower2,
  Apple,
  Battery,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { SoilParameterKey, SoilMeasurementRecord } from '../../types/thingspeak';
import { PARAMETER_CONFIGS, evaluateAgronomicStatus } from '../../utils/constants';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { formatDistanceToNow } from 'date-fns';

interface KpiCardProps {
  parameterKey: SoilParameterKey;
  latestRecord: SoilMeasurementRecord | null;
  previousRecord: SoilMeasurementRecord | null;
  onCardClick: (key: SoilParameterKey) => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  parameterKey,
  latestRecord,
  previousRecord,
  onCardClick
}) => {
  const config = PARAMETER_CONFIGS[parameterKey];
  const currentValue = latestRecord ? latestRecord[parameterKey] : null;
  const previousValue = previousRecord ? previousRecord[parameterKey] : null;

  const isAvailable = currentValue !== null && currentValue !== undefined && !isNaN(currentValue);

  // Status calculation
  const status = isAvailable
    ? evaluateAgronomicStatus(currentValue, config.defaultThreshold)
    : 'unavailable';

  // Trend calculation
  let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
  let diffPercentage: string | null = null;

  if (isAvailable && previousValue !== null && previousValue !== undefined && !isNaN(previousValue)) {
    const diff = currentValue - previousValue;
    if (Math.abs(diff) > 0.05) {
      trendDirection = diff > 0 ? 'up' : 'down';
      const pct = previousValue !== 0 ? Math.abs((diff / previousValue) * 100).toFixed(1) : '0';
      diffPercentage = `${diff > 0 ? '+' : '-'}${Math.abs(diff).toFixed(config.decimals)} (${pct}%)`;
    }
  }

  // Icons
  const getIcon = () => {
    switch (parameterKey) {
      case 'moisture':
        return <Droplets className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'pH':
        return <TestTube className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'ec':
        return <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'nitrogen':
        return <Sprout className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'phosphorus':
        return <Flower2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'potassium':
        return <Apple className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'batteryVoltage':
        return <Battery className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  const getStatusLabel = () => {
    if (!isAvailable) {
      if (['nitrogen', 'phosphorus', 'potassium'].includes(parameterKey)) {
        return 'Not available';
      }
      return 'No reading';
    }
    switch (status) {
      case 'optimal':
        return 'Optimal';
      case 'low':
        return 'Below Optimal';
      case 'high':
        return 'Above Optimal';
      case 'critical-low':
        return 'Deficient';
      case 'critical-high':
        return 'Excessive';
      default:
        return 'Normal';
    }
  };

  const timeAgo = latestRecord
    ? formatDistanceToNow(new Date(latestRecord.timestamp), { addSuffix: true })
    : 'No uploads';

  return (
    <Card
      onClick={() => onCardClick(parameterKey)}
      hoverable
      className="p-5 flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Top Bar: Label & Icon */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {config.label}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-100 dark:border-navy-700/60 group-hover:scale-105 transition-transform">
            {getIcon()}
          </div>
        </div>

        {/* Primary Value Display */}
        <div className="mt-1 flex items-baseline gap-2">
          {isAvailable ? (
            <>
              <span className="text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white font-mono">
                {currentValue.toFixed(config.decimals)}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {config.unit}
              </span>
            </>
          ) : (
            <div className="py-1">
              <span className="text-xl font-bold text-slate-400 dark:text-slate-500 italic">
                Not available
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {parameterKey === 'batteryVoltage'
                  ? 'ESP8266 ADC unmapped'
                  : 'Requires 7-in-1 NPK sensor'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Trend, Status Badge, Timestamp */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Badge status={status} size="sm">
            {getStatusLabel()}
          </Badge>

          {isAvailable && diffPercentage && (
            <div
              className={`flex items-center gap-0.5 font-medium ${
                trendDirection === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trendDirection === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-400'
              }`}
              title="Change from previous manual spot sample"
            >
              {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-mono">{diffPercentage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          <span>Details</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
    </Card>
  );
};
