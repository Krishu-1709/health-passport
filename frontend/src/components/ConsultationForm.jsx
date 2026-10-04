import { useState } from "react";
import api from "../services/api";
import { savePendingOperation } from "../db/patientCache";

function ConsultationForm({ patientId, onClose }) {
  const [symptoms, setSymptoms] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [spo2, setSpo2] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medication, setMedication] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event) {
  event.preventDefault();

  const consultation = {
    symptoms,
    blood_pressure: bloodPressure,
    heart_rate: heartRate,
    temperature,
    spo2,
    diagnosis,
    medication,
    follow_up_date: followUpDate,
    notes,
  };

  try {
    if (navigator.onLine) {
      await api.post(
        `/patients/${patientId}/consultations`,
        consultation,
      );

      alert("Consultation saved successfully!");
    } else {
      const operation = {
        operation_id: crypto.randomUUID(),
        patient_id: patientId,
        operation_type: "CREATE_CONSULTATION",
        payload: consultation,
        created_at: new Date().toISOString(),
        status: "pending",
      };

      await savePendingOperation(operation);

      alert("Saved offline. It will sync when internet returns.");
    }

    onClose();
  } catch (error) {
    console.error(error);
    alert("Failed to save consultation.");
  }
}

  return (
    <section>
      <h2>Add Consultation</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Symptoms / Complaints</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <div>
          <label>Blood Pressure</label>
          <input
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            placeholder="120/80"
          />
        </div>

        <div>
          <label>Heart Rate</label>
          <input
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="72"
          />
        </div>

        <div>
          <label>Temperature</label>
          <input
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="98.6"
          />
        </div>

        <div>
          <label>SpO2</label>
          <input
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            placeholder="98"
          />
        </div>

        <div>
          <label>Diagnosis</label>
          <input
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div>
          <label>Medication</label>
          <textarea
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
          />
        </div>

        <div>
          <label>Follow-up Date</label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit">
          Save Consultation
        </button>

        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </section>
  );
}

export default ConsultationForm;