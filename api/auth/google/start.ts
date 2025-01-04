// api/auth/google/start.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // We'll read userId from query or session, identifying who is connecting.
  const { userId, patientId } = req.query as { userId?: string, patientId?: string };
  if (!userId) {
    return res.status(400).send("Missing userId");
  }

  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ];

  // Generate the url
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // ensures we get a refresh token
    state: JSON.stringify({ userId, patientId }),
  });

  // Redirect the user to Google's consent page
  return res.redirect(url);
}
