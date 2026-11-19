import React, { useState } from 'react';
import { SoilSenseProvider } from './context/SoilSenseContext';
import { Layout } from './components/layout/Layout';
import { NavPage } from './components/layout/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RecordsPage } from './pages/RecordsPage';
import { DevicePage } from './pages/DevicePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage onNavigate={setCurrentPage} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'records':
        return <RecordsPage />;
      case 'device':
        return <DevicePage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onSelectPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <SoilSenseProvider>
      <AppContent />
    </SoilSenseProvider>
  );
};

export default App;
