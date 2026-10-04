from datetime import date, datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models import User, Patient, Consultation, AuditLog

from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def seed_database():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Clear existing demo data
        db.query(AuditLog).delete()
        db.query(Consultation).delete()
        db.query(Patient).delete()
        db.query(User).delete()

        # --------------------------------------------------
        # DEMO USERS
        # --------------------------------------------------

        doctor = User(
            email="doctor@demo.com",
            password_hash=hash_password("demo123"),
            name="Dr. Sharma",
            role="doctor",
        )

        worker = User(
            email="worker@demo.com",
            password_hash=hash_password("demo123"),
            name="Anita Health Worker",
            role="health_worker",
        )

        db.add_all([doctor, worker])
        db.flush()

        # --------------------------------------------------
        # PATIENT 1 — PREGNANCY
        # --------------------------------------------------

        anita = Patient(
            name="Anita Kumari",
            age=28,
            sex="Female",
            phone="9000000001",
            village="Rampur",
            blood_group="B+",
            emergency_contact="Rakesh Kumar - 9000000011",
            allergies=["Penicillin"],
            medications=["Iron + Folic Acid"],
            conditions=[],
            vaccinations=[
                "Tetanus - Dose 1",
                "COVID-19 - Complete",
            ],
            health_markers={
                "pregnancy": {
                    "gestational_age": "22 weeks",
                    "expected_delivery_date": "2027-02-12",
                    "risk_level": "HIGH",
                }
            },
        )

        # --------------------------------------------------
        # PATIENT 2 — DIABETES + HYPERTENSION
        # --------------------------------------------------

        ramesh = Patient(
            name="Ramesh Kumar",
            age=54,
            sex="Male",
            phone="9000000002",
            village="Chandpur",
            blood_group="O+",
            emergency_contact="Sunita Kumar - 9000000022",
            allergies=[],
            medications=[
                "Metformin 500mg",
                "Amlodipine 5mg",
            ],
            conditions=[
                "Type 2 Diabetes",
                "Hypertension",
            ],
            vaccinations=[
                "COVID-19 - Complete",
            ],
            health_markers={
                "diabetes": {
                    "last_glucose": 142,
                    "hba1c": 7.1,
                },
                "hypertension": {
                    "latest_bp": "150/95",
                    "bp_status": "Above target",
                },
            },
        )

        # --------------------------------------------------
        # PATIENT 3 — HYPERTENSION
        # --------------------------------------------------

        sita = Patient(
            name="Sita Devi",
            age=42,
            sex="Female",
            phone="9000000003",
            village="Lakshmi Nagar",
            blood_group="A+",
            emergency_contact="Mohan Devi - 9000000033",
            allergies=["Aspirin"],
            medications=["Amlodipine 5mg"],
            conditions=["Hypertension"],
            vaccinations=[
                "COVID-19 - Complete",
            ],
            health_markers={
                "hypertension": {
                    "latest_bp": "145/90",
                    "bp_status": "Needs monitoring",
                }
            },
        )

        db.add_all([anita, ramesh, sita])
        db.flush()

        # --------------------------------------------------
        # CONSULTATIONS
        # --------------------------------------------------

        consultation_1 = Consultation(
            patient_id=anita.id,
            doctor_id=doctor.id,
            created_at=datetime.utcnow() - timedelta(days=2),
            symptoms="Routine antenatal check-up",
            diagnosis="Pregnancy - 22 weeks",
            medication="Continue Iron + Folic Acid",
            follow_up_date=date.today() + timedelta(days=14),
            blood_pressure="130/85",
            heart_rate=78,
            temperature=98.4,
            spo2=99,
            notes="Routine antenatal monitoring. Follow-up in 2 weeks.",
        )

        consultation_2 = Consultation(
            patient_id=ramesh.id,
            doctor_id=doctor.id,
            created_at=datetime.utcnow() - timedelta(days=5),
            symptoms="Increased thirst and fatigue",
            diagnosis="Type 2 Diabetes, Hypertension",
            medication="Continue Metformin and Amlodipine",
            follow_up_date=date.today() + timedelta(days=30),
            blood_pressure="150/95",
            heart_rate=82,
            temperature=98.6,
            spo2=98,
            notes="Lifestyle modification and regular glucose monitoring advised.",
        )

        consultation_3 = Consultation(
            patient_id=sita.id,
            doctor_id=doctor.id,
            created_at=datetime.utcnow() - timedelta(days=8),
            symptoms="Occasional headache",
            diagnosis="Hypertension",
            medication="Continue Amlodipine 5mg",
            follow_up_date=date.today() + timedelta(days=21),
            blood_pressure="145/90",
            heart_rate=76,
            temperature=98.2,
            spo2=99,
            notes="Monitor blood pressure regularly.",
        )

        db.add_all([
            consultation_1,
            consultation_2,
            consultation_3,
        ])

        db.flush()

        # --------------------------------------------------
        # AUDIT LOGS
        # --------------------------------------------------

        db.add_all([
            AuditLog(
                user_id=doctor.id,
                patient_id=anita.id,
                action="Viewed patient record",
                created_at=datetime.utcnow() - timedelta(days=2),
            ),
            AuditLog(
                user_id=doctor.id,
                patient_id=ramesh.id,
                action="Viewed patient record",
                created_at=datetime.utcnow() - timedelta(days=5),
            ),
            AuditLog(
                user_id=doctor.id,
                patient_id=sita.id,
                action="Viewed patient record",
                created_at=datetime.utcnow() - timedelta(days=8),
            ),
        ])

        db.commit()

        print("Database seeded successfully!")
        print()
        print("Demo accounts:")
        print("Doctor:       doctor@demo.com / demo123")
        print("Health worker: worker@demo.com / demo123")
        print()
        print("Patients:")
        print(f"Anita Kumari:  {anita.id}")
        print(f"Ramesh Kumar:  {ramesh.id}")
        print(f"Sita Devi:     {sita.id}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()