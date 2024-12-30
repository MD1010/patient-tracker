import { GenericQueryCtx } from "convex/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { treatmentsSchema } from "./schemas";
import { getUserIdentity } from "./utils/auth";

const getPatientTreatments = async (
  ctx: GenericQueryCtx<DataModel>,
  patientId: Id<"patients">
) => {
  const userId = await getUserIdentity(ctx);
  if (!userId) throw new Error("Unauthorized");

  const treatments = await ctx.db
    .query("treatments")

    .withIndex("by_userId_patientId", (q) =>
      q.eq("userId", userId).eq("patientId", patientId)
    )

    .collect();

  return treatments.sort(
    (a, b) =>
      new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime()
  );
};

export async function getLastTreatmentDate(
  ctx: GenericQueryCtx<DataModel>,
  patientId: Id<"patients">
) {
  // Fetch all treatments for the patient
  const treatments = await getPatientTreatments(ctx, patientId);
  return treatments?.[0]?.date;
}

export const get = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }) => {
    const treatments = await getPatientTreatments(ctx, patientId);
    return treatments;
  },
});

export const add = mutation({
  args: v.object({
    ...treatmentsSchema,
    userTimeZone: v.string(),
    userId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getUserIdentity(ctx);
    if (!userId) throw new Error("Unauthorized");

    const { userTimeZone, ...treatmentSchema } = args;
    // Insert the new treatment
    const treatmentId = await ctx.db.insert("treatments", {
      ...treatmentSchema,
      userId,
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
    userId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getUserIdentity(ctx);
    const treatment = await ctx.db.get(args._id);

    // Ensure the treatment belongs to the user
    if (treatment?.userId !== userId) throw new Error("Unauthorized");

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
    const userId = await getUserIdentity(ctx); // Get userId for authorization

    const treatment = await ctx.db.get(args.treatmentId);

    // Ensure the treatment belongs to the user
    if (treatment?.userId !== userId) throw new Error("Unauthorized");

    // Delete the treatment
    await ctx.db.delete(args.treatmentId);
  },
});
