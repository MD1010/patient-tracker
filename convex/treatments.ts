import { GenericQueryCtx } from "convex/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { DataModel, Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { treatmentsSchema } from "./schemas";

export async function getLastTreatmentDate(
  ctx: GenericQueryCtx<DataModel>,
  patientId: Id<"patients">
) {
  // Fetch all treatments for the patient
  let treatments: Doc<"treatments">[] = await ctx.db
    .query("treatments")
    .withIndex("by_patientId_date", (q) => q.eq("patientId", patientId))
    .collect();

  treatments = treatments.sort(
    (a, b) =>
      new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime()
  );

  return treatments?.[0]?.date;
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
      (a, b) =>
        new Date(b._creationTime).getTime() -
        new Date(a._creationTime).getTime()
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
    const treatmentId = await ctx.db.insert("treatments", {
      ...treatmentSchema,
    });

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
    // Update the treatment document
    await ctx.db.patch(args._id, {
      type: args.type,
      description: args.description,
      cost: args.cost,
      date: args.date,
      notes: args.notes,
    });
  },
});

export const deleteOne = mutation({
  args: {
    treatmentId: v.string(),
  },
  handler: async (ctx, args: { treatmentId: Id<"treatments"> }) => {
    // Delete the treatment
    await ctx.db.delete(args.treatmentId);
  },
});
