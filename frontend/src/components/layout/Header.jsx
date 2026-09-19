import React from 'react';
import { User, Activity, CheckCircle2, Sun, Moon, Shield, FileSpreadsheet } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ patientId }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <header className={`h-16 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 transition-colors border-b ${
      isLight 
        ? 'bg-white/90 border-slate-200 text-slate-900 shadow-xs' 
        : 'bg-slate-900/80 border-slate-800 text-slate-100'
    }`}>
      {/* System & Research Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
          <h2 className={`text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            Clinical Orthopaedic Evaluation & Research System
          </h2>
        </div>

        <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
          isLight
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5" /> MediaPipe Vision Active
        </span>

        <span className={`hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${
          isLight
            ? 'bg-blue-50 text-blue-800 border-blue-200'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          <Shield className="w-3.5 h-3.5" /> RPwD Act 2016 Compliant
        </span>
      </div>

      {/* Patient Meta & Theme Switcher */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-slate-800/60 border-slate-700 text-slate-300'
        }`}>
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Patient: <strong className={isLight ? 'text-slate-900 font-mono' : 'text-white font-mono'}>{patientId}</strong></span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-2xs'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Formal Light Mode'}
        >
          {isLight ? (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
