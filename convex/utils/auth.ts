import { GenericActionCtx, GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { DataModel } from "../_generated/dataModel";

export const getUserIdentity = async (
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel> | GenericActionCtx<DataModel>
) => {
  const user = await ctx.auth.getUserIdentity();
  return user?.subject;
};
