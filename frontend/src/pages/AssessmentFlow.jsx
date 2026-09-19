import React, { useState } from 'react';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { assessmentApi } from '../services/assessmentApi';
import RegionSelector from '../components/assessment/RegionSelector';
import JointSelector from '../components/assessment/JointSelector';
import CameraFeed from '../components/camera/CameraFeed';
import VideoUploader from '../components/camera/VideoUploader';
import Questionnaire from '../components/assessment/Questionnaire';
import ScoreBreakdown from '../components/reports/ScoreBreakdown';
import ExplainabilityTree from '../components/reports/ExplainabilityTree';
import PDFPreviewModal from '../components/reports/PDFPreviewModal';
import { Check, Camera, FileVideo } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AssessmentFlow() {
  const session = useAssessmentSession();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [motionInputMode, setMotionInputMode] = useState('live'); // 'live' or 'video'

  const handleEvaluateSubmission = async () => {
    const payload = {
      patient_id: session.patientId,
      body_region: session.bodyRegion,
      body_side: session.bodySide,
      selected_joint: session.selectedJoint,
      measured_angles: session.recordedMaxAngles,
      questionnaire_responses: session.questionnaireAnswers,
    };

    const res = await assessmentApi.evaluateAssessment(payload);
    session.setEvaluationResult(res);
  };

  const steps = [
    { num: 1, label: 'Body Region' },
    { num: 2, label: 'Side & Joint' },
    { num: 3, label: 'Motion Test' },
    { num: 4, label: 'Questionnaire' },
    { num: 5, label: 'Clinical Report' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 5-Step Stepper Progress Bar */}
      <div className={`rounded-2xl p-4 border transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-2xs'
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((s, idx) => {
            const isDone = session.currentStep > s.num;
            const isCurrent = session.currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? isLight
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 font-bold'
                          : 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                        : isLight
                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                          : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-xs font-semibold hidden md:inline ${
                    isCurrent 
                      ? isLight ? 'text-blue-700 font-bold' : 'text-blue-400' 
                      : isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    session.currentStep > s.num 
                      ? 'bg-emerald-600' 
                      : isLight ? 'bg-slate-200' : 'bg-slate-800'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Dynamic Step Content Rendering */}
      {session.currentStep === 1 && (
        <RegionSelector
          selectedRegion={session.bodyRegion}
          setSelectedRegion={session.setBodyRegion}
          onNext={() => session.setCurrentStep(2)}
        />
      )}

      {session.currentStep === 2 && (
        <JointSelector
          bodyRegion={session.bodyRegion}
          bodySide={session.bodySide}
          setBodySide={session.setBodySide}
          selectedJoint={session.selectedJoint}
          setSelectedJoint={session.setSelectedJoint}
          onPrev={() => session.setCurrentStep(1)}
          onNext={() => session.setCurrentStep(3)}
        />
      )}

      {session.currentStep === 3 && (
        <div className="space-y-6">
          {/* Mode Switcher: Live WebCam vs MP4 Video Upload */}
          <div className="flex justify-center">
            <div className={`p-1.5 rounded-2xl inline-flex gap-2 border shadow-xs ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/90 border-slate-800'
            }`}>
              <button
                onClick={() => setMotionInputMode('live')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  motionInputMode === 'live'
                    ? isLight
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live WebCam Camera</span>
              </button>

              <button
                onClick={() => setMotionInputMode('video')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  motionInputMode === 'video'
                    ? isLight
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileVideo className="w-4 h-4" />
                <span>Upload Recorded Video (MP4)</span>
              </button>
            </div>
          </div>

          {motionInputMode === 'live' ? (
            <CameraFeed
              selectedJoint={session.selectedJoint}
              bodySide={session.bodySide}
              bodyRegion={session.bodyRegion}
              recordedMaxAngles={session.recordedMaxAngles}
              setRecordedMaxAngles={session.setRecordedMaxAngles}
              onPrev={() => session.setCurrentStep(2)}
              onNext={() => session.setCurrentStep(4)}
            />
          ) : (
            <VideoUploader
              selectedJoint={session.selectedJoint}
              bodySide={session.bodySide}
              onPrev={() => session.setCurrentStep(2)}
              onNext={() => session.setCurrentStep(4)}
              recordedMaxAngles={session.recordedMaxAngles}
              setRecordedMaxAngles={session.setRecordedMaxAngles}
            />
          )}
        </div>
      )}

      {session.currentStep === 4 && (
        <Questionnaire
          selectedJoint={session.selectedJoint}
          questionnaireAnswers={session.questionnaireAnswers}
          setQuestionnaireAnswers={session.setQuestionnaireAnswers}
          onPrev={() => session.setCurrentStep(3)}
          onNext={() => session.setCurrentStep(5)}
          onSubmitAssessment={handleEvaluateSubmission}
        />
      )}

      {session.currentStep === 5 && session.evaluationResult && (
        <div className="space-y-6">
          <ScoreBreakdown evaluationResult={session.evaluationResult} />
          <ExplainabilityTree triggeredRules={session.evaluationResult.triggered_rules} />
          <PDFPreviewModal
            sessionUuid={session.evaluationResult.session_uuid}
            onNewAssessment={session.resetSession}
          />
        </div>
      )}
    </div>
  );
}
