import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { generatePatientInfoPdf } from "./reports/generatePdf";
import { sendEmailWithPDF } from "./reports/sendEmail";
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

export const getPatient = internalQuery({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    return patient;
  },
});

export const sendEmailWithAttachment = action({
  args: { patientId: v.id("patients"), userTimeZone: v.string() },
  handler: async (ctx, args) => {
    const patient = await ctx.runQuery(internal.patients.getPatient, {
      patientId: args.patientId,
    });

    const treatments = await ctx.runQuery(api.treatments.get, {
      patientId: args.patientId,
    });
    if (patient) {
      await sendEmailWithPDF({ patient, treatments, userTimeZone: args.userTimeZone });
    }
  },
});

export const generatePatientInfo = action({
  args: { patientId: v.id("patients"), userTimeZone: v.string() },
  handler: async (ctx, args) => {
    const patient = await ctx.runQuery(internal.patients.getPatient, {
      patientId: args.patientId,
    });

    const treatments = await ctx.runQuery(api.treatments.get, {
      patientId: args.patientId,
    });
    if (patient) {
      const res = await generatePatientInfoPdf(patient, treatments, args.userTimeZone);
      return res;
    }
  },
});

export const backfillNextTreatmentRecallDate = mutation(async ({ db }) => {
  const patients = await db.query("patients").collect();

  for (const patient of patients) {
    if (!patient.nextTreatmentRecallDate) {
      await db.patch(patient._id, {
        nextTreatmentRecallDate: null, // Default value, or provide a meaningful default
      });
    }
  }
});