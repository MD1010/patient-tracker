import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { getUserIdentity } from "./utils/auth";

export const get = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const authenticatedUser = (await getUserIdentity(ctx)) || userId;
    if (!authenticatedUser) throw new Error("Unauthorized");

    return ctx.db.query("users").filter((q) => q.eq(q.field("userId"), userId)).first();
  },
});
