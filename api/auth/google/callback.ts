// api/auth/google/callback.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

/**
 * We'll fetch from our Convex function to store tokens
 */
async function storeTokensInConvex(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiryDate: number
) {
  // Example: calling your Convex endpoint
  // You might use a fetch call to your production or dev Convex function
  // Or use the 'convex' npm client if you have an auth context.
  const response = await fetch(
    process.env.CONVEX_ACTIONS_URL + "/api/storeGoogleTokens",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CONVEX_AUTH_TOKEN}`,
        // Or a user token
      },
      body: JSON.stringify({
        userId,
        accessToken,
        refreshToken,
        expiryDate,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to store tokens in Convex");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const { code, state } = req.query as { code?: string; state?: string };
  if (!code) {
    return res.status(400).send("Missing authorization code.");
  }

  // We embedded userId in the 'state' param
  let userId: string | undefined;
  let patientId: string | undefined;
  try {
    const parsedState = JSON.parse(state || "{}");
    userId = parsedState.userId;
    patientId = parsedState.patientId;
  } catch {}
  if (!userId) {
    return res.status(400).send("Missing userId in state.");
  }

  try {
    // Exchange auth code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    // tokens.access_token, tokens.refresh_token, tokens.expiry_date, etc.

    if (!tokens.access_token || !tokens.refresh_token) {
      return res.status(400).send("Missing tokens in response from Google.");
    }

    // Save them in Convex
    await storeTokensInConvex(
      userId,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date || 0
    );

    // Redirect user back to your React front end
    return res.redirect(
      `${process.env.FE_URL}/dashboard?googleAuth=success&patientId=${patientId}`
    );
  } catch (error) {
    console.error("Error exchanging code:", error);
    return res.status(500).send("Failed to exchange code for tokens");
  }
}
