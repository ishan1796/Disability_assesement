import React from 'react';
import { Download, RotateCcw, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { assessmentApi } from '../../services/assessmentApi';
import { useTheme } from '../../context/ThemeContext';

export default function PDFPreviewModal({ sessionUuid, onNewAssessment }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const downloadUrl = assessmentApi.getReportDownloadUrl(sessionUuid);

  return (
    <div className={`rounded-2xl border p-6 space-y-6 transition-all ${
      isLight
        ? 'bg-white border-slate-200 shadow-2xs'
        : 'bg-slate-900/80 border-slate-800'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <FileText className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            Formal Medical Disability Assessment Report (PDF)
          </h4>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            A clinical assessment report with goniometric measurements, rule audit trail, and Gazette disability percentage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Clinical PDF Report</span>
          </a>

          <button
            onClick={onNewAssessment}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* PDF Summary Callout */}
      <div className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed ${
        isLight
          ? 'bg-slate-50 border-slate-200 text-slate-700'
          : 'bg-slate-950/60 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Report Generated & Stored in Database</span>
        </div>
        <p>
          This document includes session metadata, measured vs baseline ROM tables, executed IF-THEN rules, functional questionnaire responses, and the combined permanent disability score calculated per Section 1.2 / Section 2.1 combining formulas.
        </p>
      </div>
    </div>
  );
}
