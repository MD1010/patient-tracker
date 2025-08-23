import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { generatePatientInfoPdf } from "./reports/generatePdf";
import { sendEmailWithPDF } from "./reports/sendEmail";
import { patientsSchema } from "./schemas/patients";
import { getLastTreatmentDate } from "./treatments";
import { getUserIdentity } from "./utils/auth";

export const get = query({
  args: {
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdentity(ctx);
    if (!userId) return [];

    let patients = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc") // Sort by creation time descending (newest first)
      .collect();

    // Apply search filter if provided
    if (args.searchQuery && args.searchQuery.trim()) {
      const searchLower = args.searchQuery.toLowerCase().trim();
      patients = patients.filter((patient) => {
        // Search in first name, last name, full name, phone, ID number, and parent phone
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const firstName = patient.firstName?.toLowerCase() || '';
        const lastName = patient.lastName?.toLowerCase() || '';
        const phone = patient.phone?.toLowerCase() || '';
        const idNumber = patient.idNumber?.toLowerCase() || '';
        const parentPhone = patient.parent?.phone?.toLowerCase() || '';
        
        return fullName.includes(searchLower) ||
               firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               phone.includes(searchLower) ||
               idNumber.includes(searchLower) ||
               parentPhone.includes(searchLower);
      });
    }

    const patientsWithLastTreatmentDate = await Promise.all(
      patients.map(async (p) => ({
        ...p,
        lastTreatmentDate: await getLastTreatmentDate(ctx, p._id, userId),
      }))
    );

    return patientsWithLastTreatmentDate;
  },
});


export const getOne = query({
  args: { patientId: v.optional(v.id("patients")) },
  handler: async (ctx, args) => {
    const userId = await getUserIdentity(ctx);

    if (!args.patientId) return null;

    const patient = await ctx.db.get(args.patientId);

    // Ensure the patient belongs to the user
    if (patient?.userId !== userId) return null;
    return patient;
  },
});

export const add = mutation({
  args: v.object({
    ...patientsSchema,
    isAdult: v.optional(v.boolean()),
    userId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getUserIdentity(ctx);

    if (!userId) throw new Error("Unauthorized");

    const dateOfBirth = new Date(args.dateOfBirth);
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();

    const patientId = await ctx.db.insert("patients", {
      ...args,
      userId, // Associate patient with the authenticated user
      isAdult: age >= 18,
      nextTreatment: null,
    });

    if (patientId) {
      const updatedPatient = await ctx.db.get(patientId);
      return updatedPatient;
    }
    return null;
  },
});

export const deleteOne = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const userId = await getUserIdentity(ctx);

    const patient = await ctx.db.get(args.patientId);

    // Ensure the patient belongs to the user
    if (patient?.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.patientId);
  },
});

export const edit = mutation({
  args: v.object({
    ...patientsSchema,
    _id: v.id("patients"),
    _creationTime: v.optional(v.number()),
    userId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getUserIdentity(ctx);

    const patient = await ctx.db.get(args._id);

    // Ensure the patient belongs to the user
    if (patient?.userId !== userId) throw new Error("Unauthorized");

    const dateOfBirth = new Date(args.dateOfBirth);
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();

    await ctx.db.patch(args._id, { ...args, isAdult: age >= 18 });

    if (patient?._id) {
      const updatedPatient = await ctx.db.get(patient?._id);
      return updatedPatient;
    }
    return null;
  },
});

export const getPatient = internalQuery({
  args: { patientId: v.id("patients"), userId: v.string() },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const patient = await ctx.db.get(args.patientId);

    // Ensure the patient belongs to the user
    if (!patient || patient?.userId !== userId) return null;

    const lastTreatmentDate = await getLastTreatmentDate(
      ctx,
      patient._id,
      userId
    );
    return { ...patient, lastTreatmentDate };
  },
});

export const sendEmailWithAttachment = action({
  args: {
    patientId: v.id("patients"),
    userTimeZone: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const patient = await ctx.runQuery(internal.patients.getPatient, {
      patientId: args.patientId,
      userId,
    });

    // Ensure the patient belongs to the user
    if (!patient || patient?.userId !== userId) throw new Error("Unauthorized");

    const user = await ctx.runQuery(internal.users.get, {
      userId: args.userId,
    });

    if (!user) throw new Error("Unauthorized");

    const treatments = await ctx.runQuery(api.treatments.get, {
      patientId: args.patientId,
      userId,
    });

    if (patient) {
      await sendEmailWithPDF({
        patient,
        treatments,
        userTimeZone: args.userTimeZone,
        user,
      });
    }
  },
});

export const generatePatientInfo = action({
  args: { patientId: v.id("patients"), userTimeZone: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserIdentity(ctx);
    if (!userId) throw new Error("Unauthorized");

    const patient = await ctx.runQuery(internal.patients.getPatient, {
      patientId: args.patientId,
      userId,
    });

    const treatments = await ctx.runQuery(api.treatments.get, {
      patientId: args.patientId,
    });
    if (patient) {
      const res = await generatePatientInfoPdf(
        patient,
        treatments,
        args.userTimeZone
      );
      return res;
    }
  },
});


