from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import (
    AuditLog,
    Consultation,
    Patient,
    SyncOperation,
    User,
)
from ..schemas import (
    ConsultationCreate,
    SyncOperationRequest,
    SyncOperationResponse,
)


router = APIRouter(
    prefix="/sync",
    tags=["Synchronization"],
)


@router.post(
    "",
    response_model=SyncOperationResponse,
)
def sync_operation(
    operation: SyncOperationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------------
    # 1. Check if this operation was already processed
    # --------------------------------------------------------

    existing_operation = db.query(SyncOperation).filter(
        SyncOperation.operation_id == operation.operation_id
    ).first()

    if existing_operation:
        return SyncOperationResponse(
            operation_id=operation.operation_id,
            status="SYNCED",
            message="Operation already processed",
        )

    # --------------------------------------------------------
    # 2. Check patient exists
    # --------------------------------------------------------

    patient = db.query(Patient).filter(
        Patient.id == operation.patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # --------------------------------------------------------
    # 3. Apply operation
    # --------------------------------------------------------

    if operation.operation_type == "CREATE_CONSULTATION":

        consultation_data = ConsultationCreate(
            **operation.payload
        )

        consultation = Consultation(
            patient_id=operation.patient_id,
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

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported operation type: {operation.operation_type}",
        )

    # --------------------------------------------------------
    # 4. Record sync operation
    # --------------------------------------------------------

    sync_record = SyncOperation(
        operation_id=operation.operation_id,
        patient_id=operation.patient_id,
        operation_type=operation.operation_type,
        payload=operation.payload,
        created_at=operation.created_at,
        status="SYNCED",
    )

    db.add(sync_record)

    # --------------------------------------------------------
    # 5. Audit the synchronized operation
    # --------------------------------------------------------

    audit = AuditLog(
        user_id=current_user.id,
        patient_id=operation.patient_id,
        action="Synchronized offline consultation",
    )

    db.add(audit)

    db.commit()

    return SyncOperationResponse(
        operation_id=operation.operation_id,
        status="SYNCED",
        message="Operation synchronized successfully",
    )