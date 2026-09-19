import React, { useEffect, useState } from 'react';
import { Cpu, FileCode, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { rulesApi } from '../services/rulesApi';
import { useTheme } from '../context/ThemeContext';

export default function RuleEngineManager() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [joints, setJoints] = useState([]);
  const [selectedJoint, setSelectedJoint] = useState('shoulder');
  const [ruleConfig, setRuleConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rulesApi.listRules().then(res => {
      if (res.joints && res.joints.length > 0) {
        setJoints(res.joints);
      }
    }).catch(err => console.error("Failed to list rules:", err));
  }, []);

  useEffect(() => {
    if (!selectedJoint) return;
    setLoading(true);
    rulesApi.getJointRules(selectedJoint)
      .then(res => setRuleConfig(res))
      .catch(err => console.error("Failed to load joint rules:", err))
      .finally(() => setLoading(false));
  }, [selectedJoint]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h3 className={`text-2xl font-bold tracking-tight mb-1 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          <Cpu className={`w-6 h-6 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          Explainable Rule Engine JSON Configurator
        </h3>
        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Inspect transparent IF-THEN rules, score thresholds, functional questionnaire weights, and non-diagnostic disease mappings.
        </p>
      </div>

      {/* Joint Tabs */}
      <div className="flex flex-wrap gap-2">
        {['shoulder', 'elbow', 'knee', 'hip', 'ankle', 'neck', 'spine'].map((j) => {
          const active = selectedJoint === j;
          return (
            <button
              key={j}
              onClick={() => setSelectedJoint(j)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {j}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : ruleConfig ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movement Range Rules */}
          <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
            isLight
              ? 'bg-white border-slate-200 shadow-2xs'
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <h4 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <FileCode className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              Range of Motion (ROM) Score Rules
            </h4>

            {Object.entries(ruleConfig.movements || {}).map(([movName, movData]) => (
              <div key={movName} className={`space-y-2 border p-4 rounded-xl ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold capitalize text-sm ${isLight ? 'text-blue-800' : 'text-cyan-300'}`}>{movName}</span>
                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Normal: {movData.normal_angle}°</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  {movData.rules?.map((r, idx) => (
                    <div key={idx} className={`flex items-center justify-between text-xs p-2 rounded border ${
                      isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800/80 text-slate-300'
                    }`}>
                      <span className="font-mono">IF {r.min}° to {r.max}°</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{r.severity}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Score: +{r.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Questionnaire & Disease Suggestion Mappings */}
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-2xs'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Functional Questionnaire Score Weights</h4>
              <div className="space-y-2 text-xs">
                {Object.entries(ruleConfig.questionnaire_scoring || {}).map(([qKey, opts]) => (
                  <div key={qKey} className={`p-3 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <span className={`font-semibold block mb-1 capitalize ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{qKey.replace('_', ' ')}</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(opts).map(([ans, pts]) => (
                        <span key={ans} className={`px-2 py-1 rounded border text-[11px] ${
                          isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}>
                          {ans}: <strong className="text-blue-600 dark:text-cyan-400 font-mono">+{pts} pts</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {ruleConfig.disease_suggestions && (
              <div className={`p-6 rounded-2xl border space-y-3 transition-all ${
                isLight
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-900/80 border-slate-800'
              }`}>
                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Rule-Driven Disease Suggestions</h4>
                <div className="space-y-2 text-xs">
                  {ruleConfig.disease_suggestions.map((d, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border space-y-1 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <span className={`font-bold block ${isLight ? 'text-blue-800' : 'text-cyan-400'}`}>• {d.condition}</span>
                      <span className={`font-mono text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Rule: {d.rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
