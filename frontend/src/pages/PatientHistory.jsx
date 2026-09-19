import React, { useEffect, useState } from 'react';
import { History, Download, FileText, Loader2, Calendar, User, Trash2 } from 'lucide-react';
import { assessmentApi } from '../services/assessmentApi';
import { useTheme } from '../context/ThemeContext';

export default function PatientHistory() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUuid, setDeletingUuid] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = () => {
    setLoading(true);
    assessmentApi.listSessions()
      .then(data => setSessions(data))
      .catch(err => console.error("Error loading patient archives:", err))
      .finally(() => setLoading(false));
  };

  const handleDeleteSession = async (sessionUuid, patientId, joint) => {
    if (!window.confirm(`Are you sure you want to delete assessment record for Patient ${patientId} (${joint})?`)) {
      return;
    }

    setDeletingUuid(sessionUuid);
    try {
      await assessmentApi.deleteSession(sessionUuid);
      setSessions(prev => prev.filter(s => s.session_uuid !== sessionUuid));
    } catch (err) {
      console.error("Error deleting session:", err);
      alert("Failed to delete assessment session.");
    } finally {
      setDeletingUuid(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h3 className={`text-2xl font-bold tracking-tight mb-1 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          <History className={`w-6 h-6 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          Patient Assessment Archives & PDF Reports
        </h3>
        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Archived disability assessments stored in database. Download ReportLab PDF files or delete individual assessment records.
        </p>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border text-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-500 shadow-2xs' : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          No archived sessions found. Complete an assessment to populate this database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s) => {
            const pdfUrl = assessmentApi.getReportDownloadUrl(s.session_uuid);
            const isDeleting = deletingUuid === s.session_uuid;

            return (
              <div key={s.session_uuid} className={`p-5 rounded-2xl border space-y-4 transition ${
                isLight
                  ? 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                    <span className={`font-mono font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.patient_id}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    isLight
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    Disability: {s.disability_percentage}%
                  </span>
                </div>

                <div className={`space-y-1 text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Region & Side:</span>
                    <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{s.body_region} ({s.body_side})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Target Joint:</span>
                    <span className={`font-semibold capitalize ${isLight ? 'text-blue-700' : 'text-cyan-300'}`}>{s.selected_joint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Total Score:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{s.total_score} pts</span>
                  </div>
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className={`flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteSession(s.session_uuid, s.patient_id, s.selected_joint)}
                      disabled={isDeleting}
                      className={`p-1.5 rounded-lg border transition disabled:opacity-50 ${
                        isLight
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                      title="Delete assessment"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>

                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
