import { v } from "convex/values";

export const usersSchema = {
  email: v.optional(v.string()),
  userName: v.string(),
  userId: v.string(),
  googleAuth: v.optional(
    v.object({
      accessToken: v.string(),
      refreshToken: v.string(),
      expiryDate: v.number(),
    })
  ),
};
