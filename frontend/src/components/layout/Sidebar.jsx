import React from 'react';
import { LayoutDashboard, Activity, Cpu, History, ShieldAlert, Scale, Award, BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const menuItems = [
    { id: 'dashboard', label: 'Clinical Dashboard', icon: LayoutDashboard },
    { id: 'assessment', label: 'Joint Assessment', icon: Activity },
    { id: 'gazette', label: 'Gazette Rules (RPwD)', icon: Scale },
    { id: 'rules', label: 'Rule Engine JSON', icon: Cpu },
    { id: 'history', label: 'Patient Archives', icon: History },
  ];

  return (
    <aside className={`w-64 flex flex-col justify-between p-4 min-h-screen border-r transition-colors ${
      isLight
        ? 'bg-white border-slate-200 text-slate-800 shadow-2xs'
        : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      <div>
        {/* Brand Header */}
        <div className={`flex items-center gap-3 px-2 py-4 mb-6 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`font-bold text-base tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              OrthoEval AI
            </h1>
            <span className={`text-[11px] font-semibold tracking-wide uppercase ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>
              Research & Assessment
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                  isActive
                    ? isLight
                      ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold shadow-2xs'
                      : 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : isLight
                      ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive 
                    ? (isLight ? 'text-blue-700' : 'text-blue-400') 
                    : (isLight ? 'text-slate-500' : 'text-slate-400')
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Formal Research & Gazette Footnote Badge */}
      <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-colors ${
        isLight
          ? 'bg-slate-50 border-slate-200 text-slate-600'
          : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
      }`}>
        <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-700 dark:text-cyan-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Research Methodology</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Deterministic goniometric computer vision combined with Ministry Notification S.O. 1338(E) standard.
        </p>
      </div>
    </aside>
  );
}
