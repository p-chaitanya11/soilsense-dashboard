import React, { useState, useMemo } from 'react';
import { useSoilSense } from '../context/SoilSenseContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { exportRecordsToCSV } from '../services/exportService';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Calendar
} from 'lucide-react';
import { format, isToday, subDays, isAfter } from 'date-fns';
import { SoilMeasurementRecord } from '../types/thingspeak';

export const RecordsPage: React.FC = () => {
  const { records, openRecordModal } = useSoilSense();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered & Sorted Records
  const processedRecords = useMemo(() => {
    let result = [...records];

    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        r =>
          r.entryId.toString().includes(q) ||
          r.timestamp.toLowerCase().includes(q) ||
          (r.plotTag && r.plotTag.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      result = result.filter(r => isToday(new Date(r.timestamp)));
    } else if (dateFilter === '7d') {
      const cutoff = subDays(now, 7);
      result = result.filter(r => isAfter(new Date(r.timestamp), cutoff));
    } else if (dateFilter === '30d') {
      const cutoff = subDays(now, 30);
      result = result.filter(r => isAfter(new Date(r.timestamp), cutoff));
    }

    // Sort by timestamp
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [records, searchQuery, dateFilter, sortDirection]);

  // Pagination calculation
  const totalRecords = processedRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = processedRecords.slice(startIndex, startIndex + pageSize);

  const toggleSort = () => {
    setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Entry ID, plot tag, or notes..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Quick Date Filters & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-100 dark:bg-navy-800 p-1 rounded-xl text-xs">
              {(['all', 'today', '7d', '30d'] as const).map(df => (
                <button
                  key={df}
                  onClick={() => {
                    setDateFilter(df);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    dateFilter === df
                      ? 'bg-white dark:bg-navy-900 text-brand-700 dark:text-brand-300 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                  }`}
                >
                  {df === 'all' && 'All Tests'}
                  {df === 'today' && 'Today'}
                  {df === '7d' && 'Last 7 Days'}
                  {df === '30d' && 'Last 30 Days'}
                </button>
              ))}
            </div>

            <Button
              onClick={() => exportRecordsToCSV(processedRecords, 'soilsense-testing-logs')}
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Historical Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-navy-800/70 border-b border-slate-200/80 dark:border-navy-700/80 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 hover:text-navy-900 dark:hover:text-white"
                  >
                    <span>Entry ID</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 hover:text-navy-900 dark:hover:text-white"
                  >
                    <span>Upload Timestamp</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-3 px-4">Moisture</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">pH</th>
                <th className="py-3 px-4">EC (Salinity)</th>
                <th className="py-3 px-4">NPK (Macronutrients)</th>
                <th className="py-3 px-4">Battery</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-xs">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No matching soil test records found.</span>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => {
                  const hasNPK =
                    record.nitrogen !== null ||
                    record.phosphorus !== null ||
                    record.potassium !== null;

                  return (
                    <tr
                      key={record.entryId}
                      onClick={() => openRecordModal(record)}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900 dark:text-white">
                        #{record.entryId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div>{format(new Date(record.timestamp), 'PP')}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {format(new Date(record.timestamp), 'HH:mm:ss')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-sky-600 dark:text-sky-400">
                        {record.moisture !== null ? `${record.moisture}%` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {record.temperature !== null ? `${record.temperature}°C` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-purple-600 dark:text-purple-400">
                        {record.pH !== null ? record.pH.toFixed(2) : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-mono">
                        {record.ec !== null ? `${record.ec} µS/cm` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        {hasNPK ? (
                          <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            N:{record.nitrogen} P:{record.phosphorus} K:{record.potassium}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Not available
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {record.batteryVoltage !== null
                          ? `${record.batteryVoltage}V (${record.batteryPercent}%)`
                          : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center justify-end gap-1">
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} records
            </span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-md px-2 py-0.5 text-xs text-navy-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              variant="outline"
              size="sm"
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <span className="px-2 font-medium text-navy-900 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
