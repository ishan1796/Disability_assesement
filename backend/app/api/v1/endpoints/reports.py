from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ....database.session import get_db
from ....services.assessment_service import AssessmentService
from ....services.report_service import PDFReportGenerator
from .questionnaire import QUESTIONNAIRE_DATABASE

router = APIRouter()

@router.get("/download/{session_uuid}")
def download_pdf_report(session_uuid: str, db: Session = Depends(get_db)):
    """
    Generates and streams a downloadable PDF report for the given assessment session.
    """
    session = AssessmentService.get_session_by_uuid(db, session_uuid)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found")

    report_data = {
        "session_uuid": session.session_uuid,
        "patient_id": session.patient.patient_id if session.patient else "PAT-UNKNOWN",
        "body_region": session.body_region,
        "body_side": session.body_side,
        "selected_joint": session.selected_joint,
        "measured_angles": session.measured_angles,
        "rom_score": session.rom_score,
        "questionnaire_score": session.questionnaire_score,
        "total_score": session.total_score,
        "max_possible_score": 20,
        "disability_percentage": session.disability_percentage,
        "movements_evaluation": {
            mov: {
                "measured": session.measured_angles.get(mov, 0),
                "normal": session.normal_rom_data.get(mov, 180),
                "severity": "Evaluated",
                "impairment_percent": round(max(0, (session.normal_rom_data.get(mov, 180) - session.measured_angles.get(mov, 0)) / (session.normal_rom_data.get(mov, 180) or 1) * 100), 1)
            } for mov in session.measured_angles.keys()
        },
        "triggered_rules": session.triggered_rules,
        "suggested_conditions": session.possible_conditions
    }

    pdf_bytes = PDFReportGenerator.generate_assessment_report(report_data)

    filename = f"Orthopaedic_Disability_Report_{session.selected_joint}_{session.session_uuid[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/download-questionnaires-pdf")
def download_questionnaires_pdf():
    """
    Generates and streams a downloadable PDF containing all joint questionnaires and Gazette PPI rules.
    """
    pdf_bytes = PDFReportGenerator.generate_questionnaires_pdf(QUESTIONNAIRE_DATABASE)
    filename = "RPwD_Act_2016_Questionnaires_Database.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
