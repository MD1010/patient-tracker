import { httpRouter } from "convex/server";
import { storeGoogleTokensAction, getGoogleTokensAction } from "./auth";

const http = httpRouter();

http.route({
  path: "/api/getGoogleTokens",
  method: "POST",
  handler: getGoogleTokensAction,
});

http.route({
  path: "/api/storeGoogleTokens",
  method: "POST",
  handler: storeGoogleTokensAction,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
