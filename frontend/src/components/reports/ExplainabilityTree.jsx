import React from 'react';
import { Cpu, CheckCircle2, ChevronRight, FileCode2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ExplainabilityTree({ triggeredRules = [] }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`rounded-2xl border p-6 space-y-4 transition-all ${
      isLight
        ? 'bg-white border-slate-200 shadow-2xs'
        : 'bg-slate-900/80 border-slate-800'
    }`}>
      <div className="flex items-center justify-between">
        <h4 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          <Cpu className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          Explainable Rule Execution Audit Trail
        </h4>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
          isLight
            ? 'bg-slate-100 border-slate-200 text-slate-700'
            : 'bg-slate-800 border-slate-700 text-slate-300'
        }`}>
          {triggeredRules.length} Rules Triggered
        </span>
      </div>

      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
        Every clinical impairment determination is deterministic and validated against Gazette IF-THEN rules (No Black-Box ML).
      </p>

      {triggeredRules.length === 0 ? (
        <div className={`p-4 rounded-xl border text-center text-xs ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          No pathological impairment rules were triggered. Joint motion is within normal physiological limits.
        </div>
      ) : (
        <div className="space-y-3">
          {triggeredRules.map((rule, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                isLight
                  ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider font-mono border ${
                    rule.category === 'ROM'
                      ? isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {rule.category || 'Rule'}
                  </span>
                  <span className={`font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{rule.condition}</span>
                </div>
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-cyan-400">
                  +{rule.score_added} pts
                </span>
              </div>

              <div className={`flex items-start gap-2 text-xs pt-1 border-t ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{rule.reason}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
