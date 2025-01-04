import { defineSchema, defineTable } from "convex/server";
import { patientsSchema, treatmentsSchema } from "./schemas";
import { usersSchema } from './schemas/users';

export default defineSchema({
  users: defineTable(usersSchema),
  patients: defineTable(patientsSchema),
  treatments: defineTable(treatmentsSchema).index("by_userId_patientId", [
    "userId",
    "patientId",
  ]),
});
