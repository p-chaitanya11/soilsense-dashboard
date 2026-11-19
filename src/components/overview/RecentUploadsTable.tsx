import React from 'react';
import { useSoilSense } from '../../context/SoilSenseContext';
import { Card } from '../common/Card';
import { format } from 'date-fns';
import { ExternalLink, ArrowRight, Clock } from 'lucide-react';
import { SoilMeasurementRecord } from '../../types/thingspeak';

interface RecentUploadsTableProps {
  onViewAll: () => void;
}

export const RecentUploadsTable: React.FC<RecentUploadsTableProps> = ({ onViewAll }) => {
  const { records, openRecordModal } = useSoilSense();

  const recent = [...records].reverse().slice(0, 5);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            Recent Physical Uploads
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest spot tests uploaded via ESP8266 manual push button
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
        >
          <span>View All Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase font-semibold">
              <th className="py-2.5 px-3">Entry ID</th>
              <th className="py-2.5 px-3">Upload Time</th>
              <th className="py-2.5 px-3">Moisture</th>
              <th className="py-2.5 px-3">Temp</th>
              <th className="py-2.5 px-3">pH</th>
              <th className="py-2.5 px-3">EC</th>
              <th className="py-2.5 px-3">Battery</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
            {recent.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400">
                  No cloud records found.
                </td>
              </tr>
            ) : (
              recent.map(record => (
                <tr
                  key={record.entryId}
                  onClick={() => openRecordModal(record)}
                  className="hover:bg-slate-50 dark:hover:bg-navy-800/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-semibold text-navy-900 dark:text-slate-200">
                    #{record.entryId}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {format(new Date(record.timestamp), 'MMM dd, HH:mm:ss')}
                  </td>
                  <td className="py-3 px-3 font-medium text-sky-600 dark:text-sky-400">
                    {record.moisture !== null ? `${record.moisture}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {record.temperature !== null ? `${record.temperature}°C` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 font-medium text-purple-600 dark:text-purple-400">
                    {record.pH !== null ? record.pH : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">
                    {record.ec !== null ? `${record.ec} µS` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {record.batteryVoltage !== null ? `${record.batteryVoltage}V` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
                      Details
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
