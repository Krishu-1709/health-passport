import Dexie from "dexie";

const db = new Dexie("HealthPassportDB");

db.version(1).stores({
  patients: "id",
  consultations: "id, patient_id",
  syncOperations: "operation_id, patient_id, status, created_at",
});

export default db;