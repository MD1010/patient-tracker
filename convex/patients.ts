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
    smoking: v.optional(v.boolean()),
    pregnancy: v.optional(v.boolean()),
    anesthesia: v.optional(v.boolean()),
    pregnancyWeek: v.optional(v.string()),
    cancerDetails: v.optional(v.string()),
    otherAllergies: v.optional(v.string()),
    surgeries: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patientId = await ctx.db.insert("patients", {
      ...args,
      createdAt: new Date().toISOString(),
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
// Mutation: Edit a patient by ID
export const edit = mutation({
  args: {
    _id: v.id("patients"), // Allow optional _id
    _creationTime: v.optional(v.number()),
    createdAt: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    dateOfBirth: v.string(),
    lastTreatmentDate: v.string(),
    idNumber: v.string(),
    conditions: v.optional(v.object({
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
    })),
    medications: v.optional(v.object({
      coumadin: v.boolean(),
      penicillinLatex: v.boolean(),
      otherMedications: v.string(),
    })),
    smoking: v.optional(v.boolean()),
    pregnancy: v.optional(v.boolean()),
    anesthesia: v.optional(v.boolean()),
    pregnancyWeek: v.optional(v.string()),
    cancerDetails: v.optional(v.string()),
    otherAllergies: v.optional(v.string()),
    surgeries: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, args);
  },
});
