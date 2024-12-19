/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as emails_sendEmail from "../emails/sendEmail.js";
import type * as patients from "../patients.js";
import type * as schemas_index from "../schemas/index.js";
import type * as schemas_patients from "../schemas/patients.js";
import type * as schemas_treatments from "../schemas/treatments.js";
import type * as treatments from "../treatments.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "emails/sendEmail": typeof emails_sendEmail;
  patients: typeof patients;
  "schemas/index": typeof schemas_index;
  "schemas/patients": typeof schemas_patients;
  "schemas/treatments": typeof schemas_treatments;
  treatments: typeof treatments;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
