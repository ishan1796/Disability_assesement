import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ROMGauge({ label, currentAngle, normalAngle = 180, color = 'blue' }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const percentage = Math.min(100, Math.round((currentAngle / normalAngle) * 100));

  const getColorClass = () => {
    if (percentage >= 85) return 'text-emerald-500 stroke-emerald-600';
    if (percentage >= 60) return isLight ? 'text-blue-600 stroke-blue-600' : 'text-cyan-400 stroke-cyan-500';
    if (percentage >= 40) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  return (
    <div className={`border rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 transition-all ${
      isLight
        ? 'bg-white border-slate-200 shadow-2xs'
        : 'bg-slate-900/80 border-slate-800'
    }`}>
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* SVG Circular Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className={isLight ? 'stroke-slate-100' : 'stroke-slate-800'}
            strokeWidth="3.5"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`transition-all duration-300 ${getColorClass()}`}
            strokeDasharray={`${percentage}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        <div className="absolute text-center flex flex-col items-center">
          <span className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {currentAngle}°
          </span>
          <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Normal: {normalAngle}°
          </span>
        </div>
      </div>

      <div className="text-center">
        <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{label}</span>
        <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{percentage}% of Normal ROM</span>
      </div>
    </div>
  );
}
