import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { patientsSchema } from "./schemas/patients";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const patients = await ctx.db.query("patients").collect();
    return patients;
  },
});

export const add = mutation({
  args: v.object({ ...patientsSchema, isAdult: v.optional(v.boolean()) }),
  handler: async (ctx, args) => {
    const dateOfBirth = new Date(args.dateOfBirth);
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();

    const patientId = await ctx.db.insert("patients", {
      ...args,
      isAdult: age >= 18,
      nextTreatment: null,
      lastTreatmentDate: null,
    });

    return patientId;
  },
});

export const deleteOne = mutation({
  args: {
    patientId: v.id("patients"), // Correct type-safe ID
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.patientId);
  },
});

export const edit = mutation({
  args: v.object({
    ...patientsSchema,
    _id: v.id("patients"),
    _creationTime: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const dateOfBirth = new Date(args.dateOfBirth);
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();
    await ctx.db.patch(args._id, { ...args, isAdult: age >= 18 });
  },
});
