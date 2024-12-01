import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("patients").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    dateOfBirth: v.string(),
    medicalInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patientId = await ctx.db.insert("patients", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      medicalInfo: args.medicalInfo,
      createdAt: new Date().toISOString(),
    });
    return patientId;
  },
});
