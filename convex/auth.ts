// In your Convex backend, e.g. /convex/auth.ts
import { v } from "convex/values";
import {
  httpAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";

export const getGoogleTokens = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (!user) {
      return null;
    }

    return {
      accessToken: user.googleAuth?.accessToken,
      refreshToken: user.googleAuth?.refreshToken,
      expiryDate: user.googleAuth?.expiryDate, // in ms
    };
  },
});

// In your Convex backend, e.g. /convex/auth.ts

export const storeGoogleTokens = internalMutation({
  args: {
    userId: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.number(), // e.g. 1697722489000 (timestamp in ms)
  },
  handler: async (ctx, { userId, accessToken, refreshToken, expiryDate }) => {
    // Check that the user calling this is authorized, etc.
    // For now we trust userId is correct.

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      googleAuth: {
        accessToken,
        refreshToken,
        expiryDate,
      },
    });
  },
});

export const getGoogleTokensAction = httpAction(async (ctx, request) => {
  const { userId } = await request.json();
  //todo  ctx.auth.getUserIdentity()
  try {
    const res = await ctx.runQuery(api.auth.getGoogleTokens, {
      userId,
    });

    return new Response(JSON.stringify(res), {
      status: 200,
    });
  } catch (e) {
    return new Response("Error in getGoogleTokensAction", {
      status: 500,
    });
  }
});

export const storeGoogleTokensAction = httpAction(async (ctx, request) => {
  const { userId, accessToken, refreshToken, expiryDate } =
    await request.json();
  //todo  ctx.auth.getUserIdentity()
  try {
    const res = await ctx.runMutation(internal.auth.storeGoogleTokens, {
      userId,
      accessToken,
      refreshToken,
      expiryDate,
    });

    return new Response(JSON.stringify(res), {
      status: 200,
    });
  } catch (e) {
    return new Response("Error in storeGoogleTokensAction", {
      status: 500,
    });
  }
});
