import { v } from "convex/values";

export const treatmentsSchema =  {
  patientId: v.id("patients"),
  type: v.string(),
  description: v.string(),
  date: v.string(),
  cost: v.number(),
  notes: v.optional(v.string()),
};
