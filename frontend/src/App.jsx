import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import AssessmentFlow from './pages/AssessmentFlow';
import GazetteGuidelinesViewer from './pages/GazetteGuidelinesViewer';
import RuleEngineManager from './pages/RuleEngineManager';
import PatientHistory from './pages/PatientHistory';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patientId, setPatientId] = useState('PAT-1002');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`flex min-h-screen antialiased font-sans transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F17] text-slate-100'
    }`}>
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header patientId={patientId} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onStartAssessment={() => setActiveTab('assessment')}
              onViewHistory={() => setActiveTab('history')}
            />
          )}

          {activeTab === 'assessment' && (
            <AssessmentFlow />
          )}

          {activeTab === 'gazette' && (
            <GazetteGuidelinesViewer />
          )}

          {activeTab === 'rules' && (
            <RuleEngineManager />
          )}

          {activeTab === 'history' && (
            <PatientHistory />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}
