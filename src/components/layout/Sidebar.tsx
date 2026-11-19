import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  FileSpreadsheet,
  Cpu,
  FileText,
  Settings,
  Leaf,
  BatteryCharging,
  Wifi,
  ExternalLink,
  X
} from 'lucide-react';
import { useSoilSense } from '../../context/SoilSenseContext';
import { DEFAULT_DEVICE_METADATA } from '../../utils/constants';

export type NavPage = 'overview' | 'analytics' | 'records' | 'device' | 'reports' | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onClose
}) => {
  const { latestRecord, isDemoMode } = useSoilSense();

  const navItems: { id: NavPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'analytics',
      label: 'Soil Analytics',
      icon: <LineChart className="w-4 h-4" />
    },
    {
      id: 'records',
      label: 'Historical Records',
      icon: <FileSpreadsheet className="w-4 h-4" />
    },
    {
      id: 'device',
      label: 'Device & Hardware',
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-navy-900 border-r border-slate-200/80 dark:border-navy-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Leaf className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-navy-900 dark:text-white">
                Soil<span className="text-brand-600 dark:text-brand-400">Sense</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                IoT Agronomy Pro
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-xs border border-brand-200/60 dark:border-brand-800/40 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Hardware Status Snapshot Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-navy-800">
          <div className="p-3 bg-slate-50 dark:bg-navy-800/70 border border-slate-200/70 dark:border-navy-700/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy-900 dark:text-slate-200">
                {DEFAULT_DEVICE_METADATA.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Ready
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Sensor:</span>
                <span className="font-mono text-navy-900 dark:text-slate-300">JXBS-3001-TR</span>
              </div>
              <div className="flex items-center justify-between">
                <span>MCU:</span>
                <span className="font-mono text-navy-900 dark:text-slate-300">ESP8266 Modbus</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Battery (3S):</span>
                <span className="font-medium text-navy-900 dark:text-slate-300">
                  {latestRecord?.batteryVoltage !== null && latestRecord?.batteryVoltage !== undefined
                    ? `${latestRecord.batteryVoltage}V (${latestRecord.batteryPercent}%)`
                    : '11.1V (Nominal)'}
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-200/60 dark:border-navy-700/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>Push Upload Mode</span>
              <span className="text-brand-600 dark:text-brand-400 font-semibold">Wi-Fi Off (Saving)</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
