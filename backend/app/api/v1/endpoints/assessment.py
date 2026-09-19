from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ....database.session import get_db
from ....models.schemas import EvaluateAssessmentRequest, AssessmentEvaluationResponse, PatientCreate, PatientResponse
from ....services.assessment_service import AssessmentService, rule_engine
from ....services.video_analyzer import VideoAnalyzer
from ....models.db_models import Patient, AssessmentSession

router = APIRouter()

@router.post("/evaluate", response_model=AssessmentEvaluationResponse)
def evaluate_disability(request: EvaluateAssessmentRequest, db: Session = Depends(get_db)):
    """
    Evaluates joint ROM, processes questionnaires, applies rule engine, and records assessment session.
    """
    try:
        result = AssessmentService.process_assessment(db, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze-video")
async def analyze_video_file(
    file: UploadFile = File(...),
    selected_joint: str = Form(...),
    body_side: str = Form(...)
):
    """
    Processes uploaded recorded MP4 video (10-60s) using OpenCV + MediaPipe.
    Extracts peak joint ROM angles and performs Gait Pattern analysis.
    """
    if not file.filename.lower().endswith(('.mp4', '.mov', '.avi', '.webm')):
        raise HTTPException(status_code=400, detail="Invalid video format. Please upload MP4, MOV, or WEBM video files.")

    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Video file size exceeds maximum 50 MB limit.")

    try:
        result = VideoAnalyzer.analyze_video_file(contents, selected_joint, body_side)
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error"))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing video: {str(e)}")

@router.get("/normal-rom/{joint}")
def get_normal_rom(joint: str):
    """Returns baseline normal ROM values for specified joint."""
    rom = rule_engine.normal_rom.get(joint.lower())
    if not rom:
        raise HTTPException(status_code=404, detail=f"Normal ROM data not found for joint '{joint}'")
    return {"joint": joint, "normal_rom": rom}

@router.post("/patient", response_model=PatientResponse)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    patient = AssessmentService.get_or_create_patient(
        db,
        patient_id=patient_in.patient_id,
        name=patient_in.name,
        age=patient_in.age,
        gender=patient_in.gender
    )
    return patient

@router.get("/sessions", response_model=List[Dict[str, Any]])
def list_sessions(db: Session = Depends(get_db)):
    sessions = db.query(AssessmentSession).order_by(AssessmentSession.created_at.desc()).limit(50).all()
    results = []
    for s in sessions:
        results.append({
            "session_uuid": s.session_uuid,
            "patient_id": s.patient.patient_id if s.patient else "Unknown",
            "body_region": s.body_region,
            "body_side": s.body_side,
            "selected_joint": s.selected_joint,
            "disability_percentage": s.disability_percentage,
            "total_score": s.total_score,
            "created_at": s.created_at
        })
    return results

@router.delete("/sessions/{session_uuid}")
def delete_session(session_uuid: str, db: Session = Depends(get_db)):
    """
    Deletes an individual assessment session record from the database.
    """
    session = db.query(AssessmentSession).filter(AssessmentSession.session_uuid == session_uuid).first()
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found")
    
    db.delete(session)
    db.commit()
    return {"success": True, "message": f"Assessment session {session_uuid} deleted successfully"}
