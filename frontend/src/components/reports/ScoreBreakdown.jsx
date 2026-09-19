import React from 'react';
import { ShieldCheck, Stethoscope, Scale, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ScoreBreakdown({ evaluationResult }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!evaluationResult) return null;

  const {
    disability_percentage,
    rom_score,
    questionnaire_score,
    total_score,
    max_possible_score,
    suggested_conditions,
    selected_joint,
    body_side
  } = evaluationResult;

  const getDisabilityBadge = (pct) => {
    if (pct >= 40) return { label: 'Severe Impairment (PPI)', color: isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    if (pct >= 20) return { label: 'Moderate Impairment (PPI)', color: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    if (pct >= 5) return { label: 'Mild Impairment (PPI)', color: isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    return { label: 'Normal / Minimal Impairment', color: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const badge = getDisabilityBadge(disability_percentage);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
        isLight
          ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md border-slate-700/50'
          : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
              isLight ? 'bg-white/10 text-cyan-300 border-white/20' : badge.color
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {badge.label}
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight">
              Gazette Disability Rating: <span className="text-cyan-400 font-mono">{disability_percentage}%</span>
            </h3>
            <p className="text-xs text-slate-300">
              Joint: <strong className="text-white capitalize">{body_side} {selected_joint}</strong> | Official RPwD Act 2016 Guidelines
            </p>
          </div>

          {/* Breakdown Score Cards */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-700/60 backdrop-blur-sm">
            <div className="text-center px-2">
              <span className="text-xs text-slate-400 block">ROM PPI</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{rom_score}%</span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-center px-2">
              <span className="text-xs text-slate-400 block">Additions</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">+{questionnaire_score}%</span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-center px-2">
              <span className="text-xs text-slate-400 block">Joint Limit</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{max_possible_score}%</span>
            </div>
          </div>
        </div>

        {/* Explainable Gazette Combining Formula Banner */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700/60 text-xs text-slate-300 space-y-1 font-mono">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Gazette Combining Formula: a + [ b × (90 - a) / 90 ]</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-normal font-sans">
            Base ROM Impairment: <strong>{rom_score}%</strong> | Pain & Functional Additions: <strong>{questionnaire_score}%</strong> → Combined Final Impairment: <strong className="text-cyan-300">{disability_percentage}%</strong>
          </p>
        </div>
      </div>

      {/* Gazette Rule Explanation Callout */}
      <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
        isLight
          ? 'bg-blue-50/70 border-blue-200 text-slate-700'
          : 'bg-blue-950/30 border-blue-500/20 text-slate-300'
      }`}>
        <div className={`flex items-center gap-2 font-bold ${isLight ? 'text-blue-800' : 'text-cyan-400'}`}>
          <Info className="w-4 h-4" />
          <span>Why is the Joint Maximum Limit {max_possible_score}%?</span>
        </div>
        <p className="leading-relaxed">
          Under <strong>Section 1.2.2 of the Official Gazette of India (RPwD Act 2016)</strong>, the total arm component is assigned a maximum of 90%. Each joint has an official max weightage limit: 
          <strong className={isLight ? 'text-slate-900' : 'text-white'}> Shoulder = up to 20%</strong>, <strong className={isLight ? 'text-slate-900' : 'text-white'}>Elbow = up to 20%</strong>, <strong className={isLight ? 'text-slate-900' : 'text-white'}>Wrist = up to 10%</strong>, and <strong className={isLight ? 'text-slate-900' : 'text-white'}>Hands = up to 40%</strong>. 
          Therefore, a single elbow joint alone contributes up to a maximum of 20% permanent physical impairment (PPI).
        </p>
      </div>

      {/* Suggested Clinical Conditions */}
      {suggested_conditions && suggested_conditions.length > 0 && (
        <div className={`p-4 rounded-xl border space-y-3 transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-2xs'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <h4 className={`font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
            isLight ? 'text-blue-800' : 'text-cyan-400'
          }`}>
            <Stethoscope className="w-4 h-4" />
            Rule-Suggested Clinical Findings (Non-Diagnostic)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggested_conditions.map((c, idx) => (
              <div key={idx} className={`p-3 rounded-lg border text-xs space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
              }`}>
                <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>• {c.condition}</span>
                <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
