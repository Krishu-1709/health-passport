from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import AuditLog, Consultation, Patient, User
from ..schemas import ConsultationCreate, ConsultationResponse


router = APIRouter(
    prefix="/patients/{patient_id}/consultations",
    tags=["Consultations"],
)


# ============================================================
# GET CONSULTATION HISTORY
# ============================================================

@router.get(
    "",
    response_model=list[ConsultationResponse],
)
def get_consultations(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    consultations = db.query(Consultation).filter(
        Consultation.patient_id == patient_id
    ).order_by(
        Consultation.created_at.desc()
    ).all()

    # Audit the access
    audit = AuditLog(
        user_id=current_user.id,
        patient_id=patient_id,
        action="Viewed consultation history",
    )

    db.add(audit)
    db.commit()

    return consultations


# ============================================================
# ADD CONSULTATION
# ============================================================

@router.post(
    "",
    response_model=ConsultationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_consultation(
    patient_id: str,
    consultation_data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    consultation = Consultation(
        patient_id=patient_id,
        doctor_id=current_user.id,

        symptoms=consultation_data.symptoms,
        diagnosis=consultation_data.diagnosis,
        medication=consultation_data.medication,
        follow_up_date=consultation_data.follow_up_date,

        blood_pressure=consultation_data.blood_pressure,
        heart_rate=consultation_data.heart_rate,
        temperature=consultation_data.temperature,
        spo2=consultation_data.spo2,

        notes=consultation_data.notes,
    )

    db.add(consultation)
    db.flush()

    audit = AuditLog(
        user_id=current_user.id,
        patient_id=patient_id,
        action="Added consultation",
    )

    db.add(audit)

    db.commit()
    db.refresh(consultation)

    return consultation