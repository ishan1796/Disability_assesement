from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.session import engine
from .database.base import Base
from .api.v1.endpoints import assessment, rules, questionnaire, reports

# Initialize database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Assisted Orthopaedic Disability Assessment System API",
    description="Explainable Rule-Based AI Engine + MediaPipe Motion Analytics + ReportLab PDF Generator",
    version="1.0.0"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(assessment.router, prefix="/api/v1/assessment", tags=["Assessment"])
app.include_router(rules.router, prefix="/api/v1/rules", tags=["Rule Engine"])
app.include_router(questionnaire.router, prefix="/api/v1/questionnaire", tags=["Questionnaires"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])

@app.get("/")
def root():
    return {
        "system": "AI-Assisted Orthopaedic Disability Assessment System",
        "status": "Online & Ready",
        "docs": "/docs"
    }
