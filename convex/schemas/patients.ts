import { v } from "convex/values";

export const patientsSchema = {
  firstName: v.string(),
  lastName: v.string(),
  phone: v.string(),
  dateOfBirth: v.string(),
  isAdult: v.boolean(),
  lastTreatmentDate: v.union(v.string(), v.null()),
  nextTreatment: v.union(v.string(), v.null()),
  parent: v.optional(
    v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
    })
  ),
  arrivalSource: v.optional(v.string()),
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
    coumadin: v.boolean(),
    penicillinLatex: v.boolean(),
    otherMedications: v.string(),
  }),
  surgeries: v.optional(v.string()),
  smoking: v.optional(v.boolean()),
  pregnancy: v.optional(v.boolean()),
  anesthesia: v.optional(v.boolean()),
  pregnancyWeek: v.optional(v.string()),
  cancerDetails: v.optional(v.string()),
  otherAllergies: v.optional(v.string()),
};