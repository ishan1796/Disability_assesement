from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class PatientCreate(BaseModel):
    patient_id: str = Field(..., example="PAT-1002")
    name: str = Field(..., example="John Doe")
    age: int = Field(..., example=45)
    gender: str = Field(..., example="Male")

class PatientResponse(PatientCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EvaluateAssessmentRequest(BaseModel):
    patient_id: str
    body_region: str        # Upper Limb, Lower Limb, Neck, Spine
    body_side: str          # Left, Right, Both
    selected_joint: str     # Shoulder, Elbow, Hip, Knee, Ankle, Neck, Spine, etc.
    measured_angles: Dict[str, float]  # {"flexion": 126.0, "abduction": 110.0}
    questionnaire_responses: Dict[str, Any]

class RuleTriggerDetail(BaseModel):
    category: str
    condition: str
    score_added: float
    severity: str
    reason: str

class MovementEvaluation(BaseModel):
    measured: float
    normal: float
    severity: str
    score: float
    impairment_percent: float

class AssessmentEvaluationResponse(BaseModel):
    session_uuid: str
    patient_id: str
    body_region: str
    body_side: str
    selected_joint: str
    measured_angles: Dict[str, float]
    rom_score: float
    questionnaire_score: float
    total_score: float
    max_possible_score: float
    disability_percentage: float
    movements_evaluation: Dict[str, MovementEvaluation]
    triggered_rules: List[Dict[str, Any]]
    suggested_conditions: List[Dict[str, str]]
    explanation: str
    created_at: datetime
