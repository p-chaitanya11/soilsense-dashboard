import React, { useState } from 'react';
import { Sidebar, NavPage } from './Sidebar';
import { Header } from './Header';
import { useSoilSense } from '../../context/SoilSenseContext';
import { Toast } from '../common/Toast';
import { NoticeBanner } from '../common/NoticeBanner';
import { ParameterDetailModal } from '../parameters/ParameterDetailModal';
import { MeasurementDetailModal } from '../records/MeasurementDetailModal';

interface LayoutProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentPage,
  onSelectPage,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    toast,
    dismissToast,
    selectedParameterModal,
    closeParameterModal,
    selectedRecordModal,
    closeRecordModal
  } = useSoilSense();

  const getPageTitle = (page: NavPage): string => {
    switch (page) {
      case 'overview':
        return 'Overview Dashboard';
      case 'analytics':
        return 'Soil Analytics & Time Series';
      case 'records':
        return 'Historical Soil Testing Logs';
      case 'device':
        return 'Device & Hardware Architecture';
      case 'reports':
        return 'Reports & Data Export';
      case 'settings':
        return 'Settings & Cloud Configuration';
      default:
        return 'SoilSense Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-navy-950 flex flex-col font-sans transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          currentPageTitle={getPageTitle(currentPage)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Universal Hardware Operational Principle Notice Banner */}
          <NoticeBanner onLearnMore={() => onSelectPage('device')} />

          {/* Page Content */}
          {children}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/80 dark:border-navy-800 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <div>
              <span className="font-semibold text-navy-900 dark:text-slate-200">SoilSense</span> IoT Agricultural Platform · ESP8266 + JXBS-3001-TR RS485 Modbus Telemetry
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>ThingSpeak Feeds Integration</span>
              <span>•</span>
              <span>Manual Push-to-Cloud Upload</span>
              <span>•</span>
              <button
                onClick={() => onSelectPage('settings')}
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                Configure Channel
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Parameter Detail Modal */}
      {selectedParameterModal && (
        <ParameterDetailModal
          parameterKey={selectedParameterModal}
          isOpen={true}
          onClose={closeParameterModal}
        />
      )}

      {/* Historical Record Deep Dive Modal */}
      {selectedRecordModal && (
        <MeasurementDetailModal
          record={selectedRecordModal}
          isOpen={true}
          onClose={closeRecordModal}
        />
      )}

      {/* Active Toast Notification */}
      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          onClose={dismissToast}
        />
      )}
    </div>
  );
};
