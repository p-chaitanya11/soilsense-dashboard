import React from 'react';
import { useSoilSense } from '../../context/SoilSenseContext';
import { Card } from '../common/Card';
import { CheckCircle, AlertTriangle, AlertCircle, Info, Sliders } from 'lucide-react';
import { evaluateAgronomicStatus } from '../../utils/constants';

interface AgronomicHealthGaugeProps {
  onConfigureThresholds?: () => void;
}

export const AgronomicHealthGauge: React.FC<AgronomicHealthGaugeProps> = ({
  onConfigureThresholds
}) => {
  const { latestRecord, selectedCropPreset, activeThresholds } = useSoilSense();

  if (!latestRecord) {
    return (
      <Card className="p-5 flex flex-col justify-center items-center text-center">
        <Info className="w-8 h-8 text-slate-400 mb-2" />
        <h4 className="text-sm font-semibold text-navy-900 dark:text-white">Awaiting Cloud Feed</h4>
        <p className="text-xs text-slate-500 mt-1">Upload a sample via ESP8266 to assess soil health balance.</p>
      </Card>
    );
  }

  // Evaluate factors
  const evaluations = [
    { key: 'moisture', name: 'Moisture', val: latestRecord.moisture, thresh: activeThresholds.moisture, unit: '%' },
    { key: 'temperature', name: 'Temperature', val: latestRecord.temperature, thresh: activeThresholds.temperature, unit: '°C' },
    { key: 'pH', name: 'Soil pH', val: latestRecord.pH, thresh: activeThresholds.pH, unit: 'pH' },
    { key: 'ec', name: 'Salinity (EC)', val: latestRecord.ec, thresh: activeThresholds.ec, unit: 'µS/cm' }
  ];

  if (latestRecord.nitrogen !== null) {
    evaluations.push({ key: 'nitrogen', name: 'Nitrogen (N)', val: latestRecord.nitrogen, thresh: activeThresholds.nitrogen, unit: 'mg/kg' });
  }
  if (latestRecord.phosphorus !== null) {
    evaluations.push({ key: 'phosphorus', name: 'Phosphorus (P)', val: latestRecord.phosphorus, thresh: activeThresholds.phosphorus, unit: 'mg/kg' });
  }
  if (latestRecord.potassium !== null) {
    evaluations.push({ key: 'potassium', name: 'Potassium (K)', val: latestRecord.potassium, thresh: activeThresholds.potassium, unit: 'mg/kg' });
  }

  let optimalCount = 0;
  const issues: string[] = [];

  evaluations.forEach(item => {
    const status = evaluateAgronomicStatus(item.val, item.thresh);
    if (status === 'optimal') {
      optimalCount++;
    } else if (status === 'low') {
      issues.push(`${item.name} is slightly low (${item.val}${item.unit})`);
    } else if (status === 'high') {
      issues.push(`${item.name} is above target (${item.val}${item.unit})`);
    } else if (status === 'critical-low') {
      issues.push(`${item.name} is critically deficient (${item.val}${item.unit})`);
    } else if (status === 'critical-high') {
      issues.push(`${item.name} is critically elevated (${item.val}${item.unit})`);
    }
  });

  const totalEvaluated = evaluations.length;
  const score = Math.round((optimalCount / totalEvaluated) * 100);

  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 stroke-emerald-500';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 stroke-amber-500';
    return 'text-rose-600 dark:text-rose-400 stroke-rose-500';
  };

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              Agronomic Balance Index
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated against: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedCropPreset.name}</span>
            </p>
          </div>
          {onConfigureThresholds && (
            <button
              onClick={onConfigureThresholds}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Configure crop threshold profile"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Circular / Radial Score representation */}
        <div className="flex items-center gap-5 my-4">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                className="stroke-slate-100 dark:stroke-navy-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                className={`${getScoreColor()} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-navy-900 dark:text-white font-mono">
                {score}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Score
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="text-xs font-semibold text-navy-900 dark:text-slate-200">
              {optimalCount} of {totalEvaluated} parameters within optimal range
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {score >= 80
                ? 'Soil profile demonstrates strong nutrient and moisture equilibrium for the selected crop.'
                : score >= 60
                ? 'Minor agronomic variance detected. Review sub-surface moisture and salinity levels.'
                : 'Substantial deviation from target agronomic parameters detected. Action advised.'}
            </p>
          </div>
        </div>
      </div>

      {/* Advisory list */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Target Assessment
        </span>
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>All monitored soil parameters match target guidelines.</span>
          </div>
        ) : (
          <div className="space-y-1">
            {issues.slice(0, 2).map((issue, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
