import { GenericMutationCtx } from "convex/server";
import { v } from "convex/values";
import { DataModel, Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { treatmentsSchema } from "./schemas";
import { api } from './_generated/api';

// Helper function to update patient fields: lastTreatmentDate and nextTreatment
async function updatePatientFields(
  ctx: GenericMutationCtx<DataModel>,
  patientId: Id<"patients">
) {
  // Fetch all treatments for the patient
  let treatments: Doc<"treatments">[] = await ctx.db
    .query("treatments")
    .withIndex("by_patientId_date", (q) => q.eq("patientId", patientId))
    .collect();

  treatments = treatments.sort(
    (a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime()
  );

  if (treatments.length === 0) {
    // If no treatments, reset patient fields
    await ctx.db.patch(patientId, {
      lastTreatmentDate: null,
      nextTreatment: null,
      nextTreatmentRecallDate: null,
    });
    return;
  }

  console.log("new one", treatments[0]);

  // Get the most recent treatment date
  const lastTreatmentDate = treatments[0].date;
  const nextAppointment = treatments[0].nextAppointment;
  const nextRecallDate = treatments[0].recallDate;

  console.log("Updating patient fields", {
    rc: nextRecallDate,
    na: nextAppointment,
    patientId,
  });

  await ctx.db.patch(patientId, {
    lastTreatmentDate,
    nextTreatment: nextAppointment || null,
    nextTreatmentRecallDate: nextRecallDate || null,
  });
}

export const get = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }) => {
    // return await ctx.db
    //   .query("treatments")
    //   .withIndex("by_patientId_date", (q) => q.eq("patientId", patientId))
    //   .collect();

    let treatments: Doc<"treatments">[] = await ctx.db
      .query("treatments")
      .withIndex("by_patientId_date", (q) => q.eq("patientId", patientId))
      .collect();

    treatments = treatments.sort(
      (a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime()
    );

    return treatments;
  },
});

export const add = mutation({
  args: v.object({
    ...treatmentsSchema,
    userTimeZone: v.string(),
  }),
  handler: async (ctx, args) => {
    const { userTimeZone, ...treatmentSchema } = args;
    // Insert the new treatment
    console.log("new treatment", treatmentSchema);

    const treatmentId = await ctx.db.insert("treatments", {
      ...treatmentSchema,
    });

    // Update the patient's lastTreatmentDate and nextTreatment fields
    await updatePatientFields(ctx, args.patientId);

    // generate pdf and send it for documentation

    ctx.scheduler.runAt(new Date(), api.patients.sendEmailWithAttachment, {
      patientId: args.patientId,
      userTimeZone: args.userTimeZone,
    });

    return treatmentId;
  },
});

export const edit = mutation({
  args: v.object({
    ...treatmentsSchema,
    _id: v.id("treatments"),
    _creationTime: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    console.log("in edit", {
      nextAppointment: args.nextAppointment,
      nextRecall: args.recallDate,
    });

    // Update the treatment document
    await ctx.db.patch(args._id, {
      type: args.type,
      description: args.description,
      cost: args.cost,
      date: args.date,
      nextAppointment: args.nextAppointment,
      recallDate: args.recallDate,
      notes: args.notes,
    });

    // Update the patient's lastTreatmentDate and nextTreatment fields
    await updatePatientFields(ctx, args.patientId);
  },
});

export const deleteOne = mutation({
  args: {
    treatmentId: v.string(),
  },
  handler: async (ctx, args: { treatmentId: Id<"treatments"> }) => {
    // Find the treatment being deleted to get its patientId
    const treatment = await ctx.db.get(args.treatmentId);

    // Delete the treatment
    await ctx.db.delete(args.treatmentId);

    // If the treatment is associated with a patient, update the patient's fields
    if (treatment?.patientId) {
      await updatePatientFields(ctx, treatment.patientId);
    }
  },
});
