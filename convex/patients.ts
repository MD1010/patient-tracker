import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Fetch all patients
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("patients").collect();
  },
});

export const add = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    dateOfBirth: v.string(),
    lastTreatmentDate: v.string(),
    idNumber: v.string(),
    conditions: v.object({
      diabetes: v.optional(v.boolean()),
      osteoporosis: v.optional(v.boolean()),
      asthma: v.optional(v.boolean()),
      thyroidProblems: v.optional(v.boolean()),
      bloodClottingProblems: v.optional(v.boolean()),
      hepatitisB: v.optional(v.boolean()),
      hepatitisC: v.optional(v.boolean()),
      aids: v.optional(v.boolean()),
      hypertension: v.optional(v.boolean()),
      heartDisease: v.optional(v.boolean()),
      artificialValve: v.optional(v.boolean()),
      pacemaker: v.optional(v.boolean()),
      heartDefect: v.optional(v.boolean()),
      tuberculosis: v.optional(v.boolean()),
      kidneyDisease: v.optional(v.boolean()),
      neurologicalProblems: v.optional(v.boolean()),
      psychiatricProblems: v.optional(v.boolean()),
      chemotherapy: v.optional(v.boolean()),
      cancer: v.optional(v.boolean()),
    }),
    medications: v.object({
      coumadin: v.optional(v.boolean()),
      penicillinLatex: v.optional(v.boolean()),
      otherMedications: v.optional(v.string()),
    }),
    smoking: v.boolean(),
    pregnancy: v.boolean(),
    anesthesia: v.boolean(),
    pregnancyWeek: v.optional(v.string()),
    cancerDetails: v.optional(v.string()),
    otherAllergies: v.optional(v.string()),
    surgeries: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const defaultConditions = {
      diabetes: false,
      osteoporosis: false,
      asthma: false,
      thyroidProblems: false,
      bloodClottingProblems: false,
      hepatitisB: false,
      hepatitisC: false,
      aids: false,
      hypertension: false,
      heartDisease: false,
      artificialValve: false,
      pacemaker: false,
      heartDefect: false,
      tuberculosis: false,
      kidneyDisease: false,
      neurologicalProblems: false,
      psychiatricProblems: false,
      chemotherapy: false,
      cancer: false,
    };
    const patientId = await ctx.db.insert("patients", {
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      idNumber: args.idNumber,
      lastTreatmentDate: args.lastTreatmentDate,
      conditions: { ...defaultConditions, ...args.conditions },
      medications: args.medications,
      smoking: args.smoking,
      pregnancy: args.pregnancy,
      pregnancyWeek: args.pregnancyWeek,
      cancerDetails: args.cancerDetails,
      otherAllergies: args.otherAllergies,
      anesthesia: args.anesthesia,
      createdAt: new Date().toISOString(),
      surgeries: args.surgeries
    });
    return patientId;
  },
});

// Mutation: Delete a patient by ID
export const deleteOne = mutation({
  args: {
    patientId: v.id("patients"), // Correct type-safe ID
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.patientId);
  },
});
