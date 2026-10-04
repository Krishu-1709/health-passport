from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import AuditLog, Patient, User
from ..schemas import AuditLogResponse


router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


@router.get(
    "/patient/{patient_id}",
    response_model=list[AuditLogResponse],
)
def get_patient_audit_logs(
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

    logs = db.query(AuditLog).filter(
        AuditLog.patient_id == patient_id
    ).order_by(
        AuditLog.created_at.desc()
    ).all()

    return logs