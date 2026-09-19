import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.db_models import Patient, AssessmentSession
from ..models.schemas import EvaluateAssessmentRequest
from ..rules.rule_engine import RuleEngine

rule_engine = RuleEngine()

class AssessmentService:

    @staticmethod
    def get_or_create_patient(db: Session, patient_id: str, name: str = "Anonymous Patient", age: int = 40, gender: str = "Unspecified") -> Patient:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            patient = Patient(
                patient_id=patient_id,
                name=name,
                age=age,
                gender=gender
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)
        return patient

    @staticmethod
    def process_assessment(db: Session, request: EvaluateAssessmentRequest) -> Dict[str, Any]:
        patient = AssessmentService.get_or_create_patient(db, request.patient_id)

        # 1. Run Explainable Rule Engine
        eval_result = rule_engine.evaluate(
            joint=request.selected_joint,
            movement_angles=request.measured_angles,
            questionnaire_answers=request.questionnaire_responses
        )

        session_uuid = str(uuid.uuid4())

        # 2. Save Assessment Session to DB
        db_session = AssessmentSession(
            session_uuid=session_uuid,
            patient_id=patient.id,
            body_region=request.body_region,
            body_side=request.body_side,
            selected_joint=request.selected_joint,
            measured_angles=request.measured_angles,
            normal_rom_data=rule_engine.normal_rom.get(request.selected_joint.lower(), {}),
            questionnaire_responses=request.questionnaire_responses,
            rom_score=eval_result["rom_score"],
            questionnaire_score=eval_result["questionnaire_score"],
            total_score=eval_result["total_score"],
            disability_percentage=eval_result["disability_percentage"],
            triggered_rules=eval_result["triggered_rules"],
            possible_conditions=eval_result["suggested_conditions"],
            explanation_log=eval_result["explanation"]
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)

        response_data = {
            "session_uuid": session_uuid,
            "patient_id": patient.patient_id,
            "body_region": request.body_region,
            "body_side": request.body_side,
            "selected_joint": request.selected_joint,
            "measured_angles": request.measured_angles,
            "rom_score": eval_result["rom_score"],
            "questionnaire_score": eval_result["questionnaire_score"],
            "total_score": eval_result["total_score"],
            "max_possible_score": eval_result["max_possible_score"],
            "disability_percentage": eval_result["disability_percentage"],
            "movements_evaluation": eval_result["movements_evaluation"],
            "triggered_rules": eval_result["triggered_rules"],
            "suggested_conditions": eval_result["suggested_conditions"],
            "explanation": eval_result["explanation"],
            "created_at": db_session.created_at
        }
        return response_data

    @staticmethod
    def get_session_by_uuid(db: Session, session_uuid: str) -> AssessmentSession:
        return db.query(AssessmentSession).filter(AssessmentSession.session_uuid == session_uuid).first()
