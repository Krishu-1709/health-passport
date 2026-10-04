from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


# ============================================================
# AUTH
# ============================================================

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str


# ============================================================
# PATIENT
# ============================================================

class PatientCreate(BaseModel):
    name: str
    age: int
    sex: str
    phone: str | None = None
    village: str | None = None
    blood_group: str | None = None
    emergency_contact: str | None = None

    allergies: list[str] = []
    medications: list[str] = []
    conditions: list[str] = []
    vaccinations: list[str] = []
    health_markers: dict[str, Any] = {}


class PatientUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    sex: str | None = None
    phone: str | None = None
    village: str | None = None
    blood_group: str | None = None
    emergency_contact: str | None = None

    allergies: list[str] | None = None
    medications: list[str] | None = None
    conditions: list[str] | None = None
    vaccinations: list[str] | None = None
    health_markers: dict[str, Any] | None = None


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    age: int
    sex: str
    phone: str | None
    village: str | None
    blood_group: str | None
    emergency_contact: str | None

    allergies: list[str]
    medications: list[str]
    conditions: list[str]
    vaccinations: list[str]
    health_markers: dict[str, Any]

    created_at: datetime


# ============================================================
# CONSULTATIONS
# ============================================================

class ConsultationCreate(BaseModel):
    symptoms: str | None = None
    diagnosis: str | None = None
    medication: str | None = None
    follow_up_date: date | None = None

    blood_pressure: str | None = None
    heart_rate: int | None = None
    temperature: float | None = None
    spo2: int | None = None

    notes: str | None = None


class ConsultationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    doctor_id: str

    created_at: datetime

    symptoms: str | None
    diagnosis: str | None
    medication: str | None
    follow_up_date: date | None

    blood_pressure: str | None
    heart_rate: int | None
    temperature: float | None
    spo2: int | None

    notes: str | None


# ============================================================
# AUDIT
# ============================================================

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    patient_id: str
    action: str
    created_at: datetime
# ============================================================
# SYNC
# ============================================================

class SyncOperationRequest(BaseModel):
    operation_id: str
    patient_id: str
    operation_type: str
    payload: dict[str, Any]
    created_at: datetime


class SyncOperationResponse(BaseModel):
    operation_id: str
    status: str
    message: str