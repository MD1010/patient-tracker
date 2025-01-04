// In your Convex backend, e.g. /convex/auth.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getGoogleTokens = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      accessToken: user.googleAuth?.accessToken,
      refreshToken: user.googleAuth?.refreshToken,
      expiryDate: user.googleAuth?.expiryDate, // in ms
    };
  },
});

// In your Convex backend, e.g. /convex/auth.ts

export const storeGoogleTokens = mutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.number(), // e.g. 1697722489000 (timestamp in ms)
  },
  handler: async (ctx, { userId, accessToken, refreshToken, expiryDate }) => {
    // Check that the user calling this is authorized, etc.
    // For now we trust userId is correct.

    await ctx.db.patch(userId, {
      googleAuth: {
        accessToken,
        refreshToken,
        expiryDate,
      },
    });
  },
});
