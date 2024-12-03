import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    dateOfBirth: v.string(),
    lastTreatmentDate: v.string(),
    idNumber: v.string(),
    conditions: v.object({
      diabetes: v.boolean(),
      osteoporosis: v.boolean(),
      asthma: v.boolean(),
      thyroidProblems: v.boolean(),
      bloodClottingProblems: v.boolean(),
      hepatitisB: v.boolean(),
      hepatitisC: v.boolean(),
      aids: v.boolean(),
      hypertension: v.boolean(),
      heartDisease: v.boolean(),
      artificialValve: v.boolean(),
      pacemaker: v.boolean(),
      heartDefect: v.boolean(),
      tuberculosis: v.boolean(),
      kidneyDisease: v.boolean(),
      neurologicalProblems: v.boolean(),
      psychiatricProblems: v.boolean(),
      chemotherapy: v.boolean(),
      cancer: v.boolean(),
    }),
    medications: v.object({
      coumadin: v.optional(v.boolean()),
      penicillinLatex: v.optional(v.boolean()),
      otherMedications: v.optional(v.string()), // Any other medication info
    }),
    surgeries: v.optional(v.string()),
    smoking: v.boolean(),
    pregnancy: v.boolean(),
    anesthesia: v.boolean(),
    pregnancyWeek: v.optional(v.string()),
    cancerDetails: v.optional(v.string()),
    otherAllergies: v.optional(v.string()),
    createdAt: v.string(),
  }),

  treatments: defineTable({
    patientId: v.id("patients"),
    type: v.string(),
    description: v.string(),
    date: v.string(),
    cost: v.number(),
    nextAppointment: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_patient", ["patientId"]),
});
