import uuid
from datetime import datetime, date

from sqlalchemy import (
    String,
    Integer,
    DateTime,
    Date,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    consultations = relationship(
        "Consultation",
        back_populates="doctor",
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
    )


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    age: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    sex: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    village: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    blood_group: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    emergency_contact: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    allergies: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    medications: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    conditions: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    vaccinations: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    health_markers: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    consultations = relationship(
        "Consultation",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="patient",
        cascade="all, delete-orphan",
    )


class Consultation(Base):
    __tablename__ = "consultations"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    patient_id: Mapped[str] = mapped_column(
        ForeignKey("patients.id"),
        nullable=False,
    )

    doctor_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    symptoms: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    diagnosis: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    medication: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    follow_up_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    blood_pressure: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    heart_rate: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    temperature: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    spo2: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    patient = relationship(
        "Patient",
        back_populates="consultations",
    )

    doctor = relationship(
        "User",
        back_populates="consultations",
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    patient_id: Mapped[str] = mapped_column(
        ForeignKey("patients.id"),
        nullable=False,
    )

    action: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
        back_populates="audit_logs",
    )

    patient = relationship(
        "Patient",
        back_populates="audit_logs",
    )
class SyncOperation(Base):
    __tablename__ = "sync_operations"

    operation_id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
    )

    patient_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
    )

    operation_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    payload: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="SYNCED",
    )