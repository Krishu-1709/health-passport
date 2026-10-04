import db from "./database";

export async function cachePatient(patient) {
  await db.patients.put(patient);
}

export async function getCachedPatient(patientId) {
  return await db.patients.get(patientId);
}

export async function cacheConsultations(consultations) {
  if (!consultations || consultations.length === 0) {
    return;
  }

  await db.consultations.bulkPut(consultations);
}

export async function getCachedConsultations(patientId) {
  return await db.consultations
    .where("patient_id")
    .equals(patientId)
    .toArray();
}
export async function savePendingOperation(operation) {
  await db.syncOperations.add(operation);
}

export async function getPendingOperations() {
  return await db.syncOperations
    .where("status")
    .equals("pending")
    .toArray();
}