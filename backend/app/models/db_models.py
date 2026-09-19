from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.session import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessments = relationship("AssessmentSession", back_populates="patient", cascade="all, delete-orphan")

class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_uuid = Column(String, unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    body_region = Column(String, nullable=False) # Upper Limb, Lower Limb, Neck, Spine
    body_side = Column(String, nullable=False)   # Left, Right, Both
    selected_joint = Column(String, nullable=False)# Shoulder, Elbow, Knee, etc.

    measured_angles = Column(JSON, nullable=False)  # {"flexion": 126.0, "abduction": 110.0}
    normal_rom_data = Column(JSON, nullable=False)  # {"flexion": 180, ...}
    questionnaire_responses = Column(JSON, nullable=False)

    rom_score = Column(Float, nullable=False)
    questionnaire_score = Column(Float, nullable=False)
    total_score = Column(Float, nullable=False)
    disability_percentage = Column(Float, nullable=False)

    triggered_rules = Column(JSON, nullable=False)
    possible_conditions = Column(JSON, nullable=False)
    explanation_log = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="assessments")
