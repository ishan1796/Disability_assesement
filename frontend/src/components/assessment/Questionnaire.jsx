import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ClipboardList, Loader2, Download } from 'lucide-react';
import { assessmentApi } from '../../services/assessmentApi';
import { useTheme } from '../../context/ThemeContext';

export default function Questionnaire({
  selectedJoint,
  questionnaireAnswers,
  setQuestionnaireAnswers,
  onPrev,
  onNext,
  onSubmitAssessment
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const questionnairesPdfUrl = assessmentApi.getQuestionnairesPdfDownloadUrl();

  useEffect(() => {
    setLoading(true);
    assessmentApi.getQuestionnaire(selectedJoint)
      .then((data) => {
        setQuestions(data);
        const defaults = {};
        data.forEach(q => {
          defaults[q.id] = questionnaireAnswers[q.id] || q.options[0];
        });
        setQuestionnaireAnswers(defaults);
      })
      .catch(() => {
        const fallback = [
          { id: 'pain_level', question: 'Pain level in joint?', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { id: 'functional_impact', question: 'Does joint stiffness restrict daily activities?', options: ['No', 'Partial', 'Yes'] }
        ];
        setQuestions(fallback);
        setQuestionnaireAnswers({ pain_level: 'Mild', functional_impact: 'Partial' });
      })
      .finally(() => setLoading(false));
  }, [selectedJoint]);

  const handleChange = (questionId, value) => {
    setQuestionnaireAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmitAssessment();
      onNext();
    } catch (err) {
      console.error("Evaluation submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Loading joint-specific questionnaire...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-bold tracking-tight mb-1 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <ClipboardList className={`w-6 h-6 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            Step 4: Functional Impact Questionnaire ({selectedJoint.toUpperCase()})
          </h3>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Please answer the functional mobility questions to complete the explainable score calculation.
          </p>
        </div>

        <a
          href={questionnairesPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-300 text-blue-700 shadow-2xs'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-400'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Questionnaires PDF</span>
        </a>
      </div>

      <div className={`rounded-2xl p-6 space-y-6 border transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-2xs'
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        {questions.map((q) => (
          <div key={q.id} className={`space-y-2 pb-4 border-b last:border-0 last:pb-0 ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
            <label className={`text-sm font-semibold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {q.question}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {q.options.map((opt) => {
                const selected = questionnaireAnswers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChange(q.id, opt)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                        : isLight
                          ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700/60'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrev}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-xs transition ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Rule Engine...</span>
            </>
          ) : (
            <>
              <span>Calculate Disability Rating & Explanation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
