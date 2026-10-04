import api from "./api";
import db from "../db/database";

export async function syncPendingOperations() {
  const operations = await db.syncOperations
    .where("status")
    .equals("pending")
    .toArray();

  for (const operation of operations) {
    try {
      await api.post("/sync", operation);

      await db.syncOperations.delete(operation.operation_id);

      console.log("Synced operation:", operation.operation_id);
    } catch (error) {
      console.error(
        "Sync failed:",
        operation.operation_id,
        error,
      );
    }
  }
}