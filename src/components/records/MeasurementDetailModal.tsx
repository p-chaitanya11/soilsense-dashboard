import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SoilMeasurementRecord } from '../../types/thingspeak';
import { format } from 'date-fns';
import { PARAMETER_CONFIGS, evaluateAgronomicStatus } from '../../utils/constants';
import { useSoilSense } from '../../context/SoilSenseContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Code, CheckCircle, Clock, Zap, Download } from 'lucide-react';

interface MeasurementDetailModalProps {
  record: SoilMeasurementRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const MeasurementDetailModal: React.FC<MeasurementDetailModalProps> = ({
  record,
  isOpen,
  onClose
}) => {
  const { activeThresholds } = useSoilSense();
  const [showRawJson, setShowRawJson] = useState(false);

  const localTime = format(new Date(record.timestamp), 'PPPPpppp');
  const utcTime = record.timestamp;

  const parameters = [
    { key: 'moisture', label: 'Soil Moisture', value: record.moisture, unit: '%', decimals: 1 },
    { key: 'temperature', label: 'Soil Temperature', value: record.temperature, unit: '°C', decimals: 1 },
    { key: 'pH', label: 'Soil pH', value: record.pH, unit: 'pH', decimals: 2 },
    { key: 'ec', label: 'Electrical Conductivity', value: record.ec, unit: 'µS/cm', decimals: 0 },
    { key: 'nitrogen', label: 'Nitrogen (N)', value: record.nitrogen, unit: 'mg/kg', decimals: 0 },
    { key: 'phosphorus', label: 'Phosphorus (P)', value: record.phosphorus, unit: 'mg/kg', decimals: 0 },
    { key: 'potassium', label: 'Potassium (K)', value: record.potassium, unit: 'mg/kg', decimals: 0 },
    { key: 'batteryVoltage', label: 'Battery Voltage', value: record.batteryVoltage, unit: 'V', decimals: 2 }
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Soil Test Record #${record.entryId}`}
      subtitle="Manual push-button upload snapshot from portable SoilSense probe"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Metadata Header */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/70 dark:border-navy-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-brand-600" />
              <span className="font-semibold text-navy-900 dark:text-white">{localTime}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">UTC: {utcTime}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium px-2.5 py-1 rounded-md text-[11px]">
              Uploaded Successfully
            </span>
          </div>
        </div>

        {/* Parameter Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Recorded Sensor Readings (Modbus RTU)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {parameters.map(p => {
              const cfg = PARAMETER_CONFIGS[p.key];
              const isAvailable = p.value !== null && p.value !== undefined && !isNaN(p.value);
              const status = isAvailable
                ? evaluateAgronomicStatus(p.value, activeThresholds[p.key])
                : 'unavailable';

              return (
                <div
                  key={p.key}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-navy-800 bg-white dark:bg-navy-900 flex flex-col justify-between"
                >
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {p.label}
                  </span>
                  <div className="my-2">
                    {isAvailable ? (
                      <span className="text-xl font-bold font-mono text-navy-900 dark:text-white">
                        {p.value.toFixed(p.decimals)}{' '}
                        <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                      </span>
                    ) : (
                      <span className="text-xs italic text-slate-400 font-medium">
                        Not available
                      </span>
                    )}
                  </div>
                  <Badge status={status} size="sm">
                    {status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Raw ThingSpeak JSON View */}
        <div className="border-t border-slate-100 dark:border-navy-800 pt-4">
          <button
            onClick={() => setShowRawJson(prev => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white"
          >
            <Code className="w-4 h-4" />
            <span>{showRawJson ? 'Hide Raw Feed JSON' : 'Inspect Raw ThingSpeak Feed JSON'}</span>
          </button>

          {showRawJson && (
            <pre className="mt-2.5 p-3.5 rounded-xl bg-navy-950 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48 border border-navy-800">
              {JSON.stringify(
                {
                  entry_id: record.entryId,
                  created_at: record.timestamp,
                  field1_moisture: record.moisture,
                  field2_temperature: record.temperature,
                  field3_pH: record.pH,
                  field4_ec: record.ec,
                  field5_nitrogen: record.nitrogen,
                  field6_phosphorus: record.phosphorus,
                  field7_potassium: record.potassium,
                  field8_batteryVoltage: record.batteryVoltage,
                  calculated_battery_percent: record.batteryPercent
                },
                null,
                2
              )}
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
          <Button onClick={onClose} variant="secondary" size="sm">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
