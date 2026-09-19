import React, { useEffect, useState } from 'react';
import { Activity, Cpu, FileText, Users, ArrowRight, ShieldCheck, CheckCircle2, Trash2, Award, BookOpen, ExternalLink } from 'lucide-react';
import { assessmentApi } from '../services/assessmentApi';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard({ onStartAssessment, onViewHistory }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = () => {
    setLoading(true);
    assessmentApi.listSessions()
      .then(data => setSessions(data))
      .catch(err => console.error("Failed to load past sessions:", err))
      .finally(() => setLoading(false));
  };

  const handleDeleteSession = async (sessionUuid, patientId, joint) => {
    if (!window.confirm(`Delete assessment record for Patient ${patientId} (${joint})?`)) {
      return;
    }
    try {
      await assessmentApi.deleteSession(sessionUuid);
      setSessions(prev => prev.filter(s => s.session_uuid !== sessionUuid));
    } catch (err) {
      console.error("Error deleting session:", err);
      alert("Failed to delete assessment session.");
    }
  };

  const stats = [
    { label: 'Computer Vision Core', value: 'MediaPipe 3D Pose', icon: Activity, color: isLight ? 'text-blue-600' : 'text-cyan-400' },
    { label: 'Evaluation Protocol', value: 'Gazette S.O. 1338(E)', icon: Cpu, color: isLight ? 'text-indigo-600' : 'text-blue-400' },
    { label: 'Clinical Documentation', value: 'ReportLab PDF', icon: FileText, color: isLight ? 'text-purple-600' : 'text-purple-400' },
    { label: 'Completed Assessments', value: sessions.length, icon: Users, color: isLight ? 'text-emerald-600' : 'text-emerald-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Formal Research Welcome Banner */}
      <div className={`p-8 rounded-3xl border transition-all ${
        isLight
          ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md border-slate-700/50'
          : 'bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white border-blue-500/20 shadow-2xl'
      }`}>
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-300 border border-white/20 inline-flex items-center gap-1.5 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Academic & Clinical Research System
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30">
              RPwD Act 2016 Compliant
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            AI-Assisted Orthopaedic Disability Assessment System
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            An explainable clinical system for objective Range of Motion (ROM) measurement, goniometric pose tracking via OpenCV & MediaPipe, and deterministic Permanent Physical Impairment (PPI) scoring per Ministry of Social Justice & Empowerment guidelines.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartAssessment}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Activity className="w-4 h-4" />
              <span>Start Clinical Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800'}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <span className={`text-lg font-extrabold tracking-tight block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {s.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent Assessment Sessions Table */}
      <div className={`rounded-2xl border p-6 space-y-4 transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-2xs'
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Recent Clinical Assessment Records
            </h3>
          </div>
          <button
            onClick={onViewHistory}
            className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
              isLight ? 'text-blue-700' : 'text-cyan-400'
            }`}
          >
            <span>View Full Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className={`text-center py-10 rounded-xl border border-dashed text-xs ${
            isLight ? 'border-slate-300 text-slate-500 bg-slate-50' : 'border-slate-800 text-slate-400 bg-slate-950/40'
          }`}>
            No assessment records found in registry. Start an assessment to record clinical data.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className={isLight ? 'bg-slate-50 text-slate-700 font-semibold border-b border-slate-200' : 'bg-slate-950 text-slate-400 font-semibold border-b border-slate-800'}>
                <tr>
                  <th className="p-3.5">Patient ID</th>
                  <th className="p-3.5">Body Region & Side</th>
                  <th className="p-3.5">Joint</th>
                  <th className="p-3.5">Total Score</th>
                  <th className="p-3.5">Disability Rating</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/60 text-slate-300'}`}>
                {sessions.slice(0, 5).map((s) => (
                  <tr key={s.session_uuid} className={isLight ? 'hover:bg-slate-50/80 transition' : 'hover:bg-slate-800/40 transition'}>
                    <td className={`p-3.5 font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.patient_id}</td>
                    <td className="p-3.5">{s.body_region} ({s.body_side})</td>
                    <td className="p-3.5 capitalize font-semibold text-blue-600 dark:text-cyan-400">{s.selected_joint}</td>
                    <td className="p-3.5 font-mono">{s.total_score} pts</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-xs border ${
                        isLight
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {s.disability_percentage}%
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteSession(s.session_uuid, s.patient_id, s.selected_joint)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
