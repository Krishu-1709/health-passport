from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .routers import (
    auth,
    patients,
    consultations,
    audit,
    sync,
)
#uvicorn app.main:app --reload
#source venv/bin/activate


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Health Passport API",
    description="Offline-first rural healthcare record API",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(consultations.router)
app.include_router(audit.router)
app.include_router(sync.router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "health-passport-api",
    }