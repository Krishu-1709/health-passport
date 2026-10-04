from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import AuditLog, Patient, User
from ..schemas import PatientCreate, PatientResponse, PatientUpdate


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


# ============================================================
# GET ALL PATIENTS
# ============================================================

@router.get(
    "",
    response_model=list[PatientResponse],
)
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patients = db.query(Patient).order_by(
        Patient.created_at.desc()
    ).all()

    return patients


# ============================================================
# GET ONE PATIENT
# ============================================================

@router.get(
    "/{patient_id}",
    response_model=PatientResponse,
)
def get_patient(
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

    # Record access in audit log
    audit = AuditLog(
        user_id=current_user.id,
        patient_id=patient.id,
        action="Viewed patient record",
    )

    db.add(audit)
    db.commit()

    return patient


# ============================================================
# CREATE PATIENT
# ============================================================

@router.post(
    "",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = Patient(
        name=patient_data.name,
        age=patient_data.age,
        sex=patient_data.sex,
        phone=patient_data.phone,
        village=patient_data.village,
        blood_group=patient_data.blood_group,
        emergency_contact=patient_data.emergency_contact,
        allergies=patient_data.allergies,
        medications=patient_data.medications,
        conditions=patient_data.conditions,
        vaccinations=patient_data.vaccinations,
        health_markers=patient_data.health_markers,
    )

    db.add(patient)
    db.flush()

    audit = AuditLog(
        user_id=current_user.id,
        patient_id=patient.id,
        action="Registered new patient",
    )

    db.add(audit)
    db.commit()
    db.refresh(patient)

    return patient


# ============================================================
# UPDATE PATIENT
# ============================================================

@router.patch(
    "/{patient_id}",
    response_model=PatientResponse,
)
def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
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

    update_data = patient_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(patient, field, value)

    audit = AuditLog(
        user_id=current_user.id,
        patient_id=patient.id,
        action="Updated patient record",
    )

    db.add(audit)
    db.commit()
    db.refresh(patient)

    return patient
