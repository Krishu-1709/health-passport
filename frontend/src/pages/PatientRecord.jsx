import PatientQRCode from "../components/PatientQRCode";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ConsultationForm from "../components/ConsultationForm";
import {
  cachePatient,
  getCachedPatient,
  cacheConsultations,
  getCachedConsultations,
} from "../db/patientCache";
import "./PatientRecord.css";

function PatientRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConsultationForm, setShowConsultationForm] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  async function fetchPatient() {
    try {
      setLoading(true);
      setError("");

      if (navigator.onLine) {
        const patientResponse = await api.get(`/patients/${id}`);

        const consultationsResponse = await api.get(
          `/patients/${id}/consultations`
        );

        const auditResponse = await api.get(`/audit/patient/${id}`);

        const patientData = patientResponse.data;
        const consultationsData = consultationsResponse.data;

        setPatient(patientData);
        setConsultations(consultationsData);
        setAuditLogs(auditResponse.data);

        await cachePatient(patientData);
        await cacheConsultations(consultationsData);

        return;
      }

      const cachedPatient = await getCachedPatient(id);
      const cachedConsultations = await getCachedConsultations(id);

      if (!cachedPatient) {
        setError(
          "This patient has not been cached on this device yet."
        );
        return;
      }

      setPatient(cachedPatient);
      setConsultations(cachedConsultations);
      setAuditLogs([]);
    } catch (error) {
      console.error(error);

      try {
        const cachedPatient = await getCachedPatient(id);
        const cachedConsultations = await getCachedConsultations(id);

        if (cachedPatient) {
          setPatient(cachedPatient);
          setConsultations(cachedConsultations);
          setAuditLogs([]);
          return;
        }
      } catch (cacheError) {
        console.error(cacheError);
      }

      setError("Unable to load patient record.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading patient record...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <div className="error-icon">!</div>
          <h2>Unable to load record</h2>
          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <h2>Patient not found</h2>

          <button
            className="primary-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allergies = Array.isArray(patient.allergies)
    ? patient.allergies
    : patient.allergies
      ? [patient.allergies]
      : [];

  const medications = Array.isArray(patient.medications)
    ? patient.medications
    : patient.medications
      ? [patient.medications]
      : [];

  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <header className="app-header">
        <div className="brand-area">
          <div className="brand-mark">+</div>

          <div>
            <h1>Health Passport</h1>
            <span>Rural Health Record</span>
          </div>
        </div>

        <div className="header-status">
          <span
            className={
              isOnline
                ? "connection-status online"
                : "connection-status offline"
            }
          >
            <span className="status-dot"></span>
            {isOnline ? "Online" : "Offline Mode"}
          </span>

          <button
            className="header-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="patient-page">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="offline-banner">
            <div className="offline-banner-icon">⌁</div>

            <div>
              <strong>Offline Mode</strong>
              <p>
                You are viewing locally cached patient information.
              </p>
            </div>
          </div>
        )}

        {/* Patient Hero */}
        <section className="patient-hero">
          <div className="patient-identity">
            <div className="patient-avatar">
              {patient.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <div className="record-label">
                PATIENT RECORD
              </div>

              <h2>{patient.name}</h2>

              <p className="patient-meta">
                {patient.age} years
                <span>•</span>
                {patient.sex}
                <span>•</span>
                {patient.village}
              </p>
            </div>
          </div>

          <div className="patient-id">
            <span>Patient ID</span>
            <strong>{patient.id}</strong>
          </div>
        </section>

        {/* Critical Alerts */}
        {(allergies.length > 0 ||
          patient.health_markers?.pregnancy) && (
          <section className="critical-alerts">
            {allergies.length > 0 && (
              <div className="medical-alert allergy-alert">
                <div className="alert-icon">!</div>

                <div>
                  <span>CRITICAL ALLERGY</span>

                  <strong>
                    {allergies.join(", ")}
                  </strong>

                  <p>
                    Verify allergy before prescribing medication.
                  </p>
                </div>
              </div>
            )}

            {patient.health_markers?.pregnancy && (
              <div className="medical-alert risk-alert">
                <div className="alert-icon">!</div>

                <div>
                  <span>HIGH RISK</span>

                  <strong>
                    Pregnancy —{" "}
                    {
                      patient.health_markers.pregnancy
                        .gestational_age
                    }
                  </strong>

                  <p>
                    Risk level:{" "}
                    {
                      patient.health_markers.pregnancy
                        .risk_level
                    }
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Patient Overview */}
        <div className="record-grid">
          <section className="record-card">
            <div className="card-heading">
              <div className="card-icon">◉</div>

              <div>
                <h3>Patient Information</h3>
                <p>Basic demographic information</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span>Full Name</span>
                <strong>{patient.name}</strong>
              </div>

              <div className="info-item">
                <span>Age</span>
                <strong>{patient.age} years</strong>
              </div>

              <div className="info-item">
                <span>Sex</span>
                <strong>{patient.sex}</strong>
              </div>

              <div className="info-item">
                <span>Village</span>
                <strong>{patient.village}</strong>
              </div>

              <div className="info-item">
                <span>Phone</span>
                <strong>
                  {patient.phone || "Not available"}
                </strong>
              </div>

              <div className="info-item">
                <span>Blood Group</span>
                <strong className="blood-group">
                  {patient.blood_group || "Not available"}
                </strong>
              </div>
            </div>
          </section>

          {/* QR */}
          <section className="record-card qr-card">
            <div className="card-heading">
              <div className="card-icon">▣</div>

              <div>
                <h3>Health Passport QR</h3>
                <p>Scan to access this patient record</p>
              </div>
            </div>

            <div className="qr-container">
              <PatientQRCode patientId={patient.id} />
            </div>

            <div className="qr-security">
              <span>✓</span>
              QR contains patient ID only
            </div>
          </section>
        </div>

        {/* Medical Information */}
        <div className="record-grid">
          {medications.length > 0 && (
            <section className="record-card">
              <div className="card-heading">
                <div className="card-icon">Rx</div>

                <div>
                  <h3>Current Medications</h3>
                  <p>Active medication list</p>
                </div>
              </div>

              <div className="tag-list">
                {medications.map((medication, index) => (
                  <span className="medical-tag" key={index}>
                    {medication}
                  </span>
                ))}
              </div>
            </section>
          )}

          {patient.chronic_conditions && (
            <section className="record-card">
              <div className="card-heading">
                <div className="card-icon">+</div>

                <div>
                  <h3>Chronic Conditions</h3>
                  <p>Known ongoing conditions</p>
                </div>
              </div>

              <p className="condition-text">
                {patient.chronic_conditions}
              </p>
            </section>
          )}
        </div>

        {/* Health Markers */}
        {(patient.health_markers?.diabetes ||
          patient.health_markers?.hypertension) && (
          <section className="record-card">
            <div className="card-heading">
              <div className="card-icon">♥</div>

              <div>
                <h3>Health Markers</h3>
                <p>Important clinical indicators</p>
              </div>
            </div>

            <div className="marker-grid">
              {patient.health_markers?.diabetes && (
                <div className="health-marker">
                  <span>Diabetes</span>

                  <strong>
                    Glucose:{" "}
                    {
                      patient.health_markers.diabetes
                        .last_glucose
                    }
                  </strong>

                  <small>
                    HbA1c:{" "}
                    {
                      patient.health_markers.diabetes
                        .hba1c
                    }
                  </small>
                </div>
              )}

              {patient.health_markers?.hypertension && (
                <div className="health-marker">
                  <span>Hypertension</span>

                  <strong>
                    BP:{" "}
                    {
                      patient.health_markers.hypertension
                        .latest_bp
                    }
                  </strong>

                  <small>
                    {
                      patient.health_markers.hypertension
                        .bp_status
                    }
                  </small>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Consultation Section */}
        <section className="record-card consultation-section">
          <div className="section-header">
            <div className="card-heading">
              <div className="card-icon">✚</div>

              <div>
                <h3>Consultation History</h3>
                <p>
                  Previous visits and clinical notes
                </p>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                setShowConsultationForm(true)
              }
            >
              + Add Consultation
            </button>
          </div>

          {showConsultationForm && (
            <div className="consultation-form-wrapper">
              <ConsultationForm
                patientId={patient.id}
                onClose={() =>
                  setShowConsultationForm(false)
                }
              />
            </div>
          )}

          {consultations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">+</div>
              <h4>No consultations recorded</h4>
              <p>
                Add the patient's first consultation above.
              </p>
            </div>
          ) : (
            <div className="timeline">
              {consultations.map(
                (consultation, index) => (
                  <article
                    className="timeline-item"
                    key={consultation.id}
                  >
                    <div className="timeline-marker">
                      {index === 0 ? "●" : ""}
                    </div>

                    <div className="consultation-card">
                      <div className="consultation-date">
                        {consultation.created_at
                          ? new Date(
                              consultation.created_at
                            ).toLocaleString()
                          : "Consultation"}
                      </div>

                      <div className="consultation-details">
                        {consultation.symptoms && (
                          <div>
                            <span>Symptoms</span>
                            <strong>
                              {consultation.symptoms}
                            </strong>
                          </div>
                        )}

                        {consultation.diagnosis && (
                          <div>
                            <span>Diagnosis</span>
                            <strong>
                              {consultation.diagnosis}
                            </strong>
                          </div>
                        )}

                        {consultation.medication && (
                          <div>
                            <span>Medication</span>
                            <strong>
                              {consultation.medication}
                            </strong>
                          </div>
                        )}

                        {consultation.notes && (
                          <div className="full-width">
                            <span>Notes</span>
                            <strong>
                              {consultation.notes}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        {/* Audit */}
        <section className="record-card audit-section">
          <div className="card-heading">
            <div className="card-icon">↺</div>

            <div>
              <h3>Access History</h3>
              <p>Recent activity on this patient record</p>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <p className="muted-text">
              No access history available.
            </p>
          ) : (
            <div className="audit-list">
              {auditLogs
                .slice(0, 8)
                .map((log, index) => (
                  <div
                    className="audit-item"
                    key={log.id || index}
                  >
                    <div className="audit-icon">✓</div>

                    <div>
                      <strong>
                        {log.action ||
                          "Patient accessed"}
                      </strong>

                      <span>
                        {log.user_name ||
                          "Healthcare Worker"}
                        {" · "}
                        {log.created_at
                          ? new Date(
                              log.created_at
                            ).toLocaleString()
                          : "Unknown time"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PatientRecord;