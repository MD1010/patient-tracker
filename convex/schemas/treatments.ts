import { v } from "convex/values";

export const treatmentsSchema =  {
  patientId: v.id("patients"),
  type: v.string(),
  description: v.string(),
  date: v.string(),
  cost: v.number(),
  nextAppointment: v.optional(v.string()),
  recallDate: v.optional(v.string()),
  notes: v.optional(v.string()),
};
