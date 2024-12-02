import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { patientId: v.id('patients') },
  handler: async (ctx, { patientId }) => {
    return await ctx.db
      .query('treatments')
      .filter((q) => q.eq(q.field('patientId'), patientId))
      .order('desc')
      .collect();
  },
});

export const add = mutation({
  args: {
    patientId: v.id('patients'),
    type: v.string(),
    description: v.string(),
    date: v.string(),
    cost: v.number(),
    nextAppointment: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const treatmentId = await ctx.db.insert('treatments', {
      ...args,
      createdAt: new Date().toISOString(),
    });
    return treatmentId;
  },
});

export const deleteOne = mutation({
  args: {
    treatmentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Delete the patient by their ID
    await ctx.db.delete(args.treatmentId as Id<"treatments">);
  },
});
