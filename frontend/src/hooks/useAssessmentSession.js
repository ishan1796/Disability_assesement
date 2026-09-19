import { useState } from 'react';

export function useAssessmentSession() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Region, 2: Side & Joint, 3: Live Camera, 4: Questionnaire, 5: Report

  const [patientId, setPatientId] = useState('PAT-' + Math.floor(1000 + Math.random() * 9000));
  const [bodyRegion, setBodyRegion] = useState('Upper Limb'); // Upper Limb, Lower Limb, Neck, Spine
  const [bodySide, setBodySide] = useState('Right');         // Left, Right, Both
  const [selectedJoint, setSelectedJoint] = useState('shoulder'); // shoulder, elbow, wrist, hand, hip, knee, ankle, foot, neck, spine

  const [recordedMaxAngles, setRecordedMaxAngles] = useState({ flexion: 126.0, abduction: 110.0 });
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({});
  const [evaluationResult, setEvaluationResult] = useState(null);

  const resetSession = () => {
    setCurrentStep(1);
    setEvaluationResult(null);
    setQuestionnaireAnswers({});
    setRecordedMaxAngles({ flexion: 0, abduction: 0 });
  };

  return {
    currentStep,
    setCurrentStep,
    patientId,
    setPatientId,
    bodyRegion,
    setBodyRegion,
    bodySide,
    setBodySide,
    selectedJoint,
    setSelectedJoint,
    recordedMaxAngles,
    setRecordedMaxAngles,
    questionnaireAnswers,
    setQuestionnaireAnswers,
    evaluationResult,
    setEvaluationResult,
    resetSession,
  };
}
