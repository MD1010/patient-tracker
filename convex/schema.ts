import { defineSchema, defineTable } from "convex/server";
import { patientsSchema, treatmentsSchema } from "./schemas";

export default defineSchema({
  patients: defineTable(patientsSchema),
  treatments: defineTable(treatmentsSchema).index("by_userId_patientId", [
    "userId",
    "patientId",
  ]),
});
