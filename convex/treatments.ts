import { GenericMutationCtx } from "convex/server";
import { v } from "convex/values";
import { DataModel, Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { treatmentsSchema } from "./schemas";

// Helper function to update patient fields: lastTreatmentDate and nextTreatment
async function updatePatientFields(
  ctx: GenericMutationCtx<DataModel>,
  patientId: Id<"patients">
) {
  // Fetch all treatments for the patient
  const treatments: Doc<"treatments">[] = await ctx.db
    .query("treatments")
    .filter((q) => q.eq(q.field("patientId"), patientId))
    .order("desc")
    .collect();

  if (treatments.length === 0) {
    // If no treatments, reset patient fields
    await ctx.db.patch(patientId, {
      lastTreatmentDate: null,
      nextTreatment: null,
    });
    return;
  }

  // Get the most recent treatment date
  const lastTreatmentDate = treatments[0].date;

  // Get the earliest upcoming nextAppointment
  const nextAppointment =
    treatments
      .filter((treatment) => treatment.nextAppointment)
      .map((treatment) => new Date(treatment.nextAppointment!))
      .sort((a, b) => a.getTime() - b.getTime())[0]
      ?.toISOString() ?? null;

  // Update the patient with the calculated fields
  await ctx.db.patch(patientId, {
    lastTreatmentDate,
    nextTreatment: nextAppointment,
  });
}

export const get = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }: { patientId: Id<"patients"> }) => {
    return await ctx.db
      .query("treatments")
      .filter((q) => q.eq(q.field("patientId"), patientId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: v.object(treatmentsSchema),
  handler: async (ctx, args) => {
    // Insert the new treatment
    const treatmentId = await ctx.db.insert("treatments", {
      ...args,
    });

    // Update the patient's lastTreatmentDate and nextTreatment fields
    await updatePatientFields(ctx, args.patientId);

    return treatmentId;
  },
});

export const edit = mutation({
  args: v.object({ ...treatmentsSchema, _id: v.id("treatments") }),
  handler: async (ctx, args) => {
    // Update the treatment document
    await ctx.db.patch(args._id, {
      type: args.type,
      description: args.description,
      cost: args.cost,
      date: args.date,
      nextAppointment: args.nextAppointment,
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
