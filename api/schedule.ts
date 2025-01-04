// file: /api/scheduleMeeting.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
// You'd import or define these helper functions yourself:
// import { getTokensFromConvex, storeTokensInConvex } from "../lib/convexHelpers";

function enableCORS(req: VercelRequest, res: VercelResponse): boolean {
  // Handle the CORS preflight request
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(200).end();
    return true; // Indicates we've already sent the response
  }

  // For actual requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return false; // Continue
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1) CORS handling
  if (enableCORS(req, res)) return; // If it was an OPTIONS request, stop here

  // 2) Parse inputs (from query string or JSON body)
  const {
    userId,
    date,       // "YYYY-MM-DD"
    time,       // "HH:MM"
    calendarId = "primary",
  } = req.query as {
    userId?: string;
    date?: string;
    time?: string;
    calendarId?: string;
  };

  if (!userId) {
    return res.status(400).json({ error: "Missing userId param" });
  }
  if (!date) {
    return res.status(400).json({ error: "Missing date param (YYYY-MM-DD)" });
  }
  if (!time) {
    return res.status(400).json({ error: "Missing time param (HH:MM)" });
  }

  // 3) Retrieve tokens from Convex (or your DB)
  let { accessToken, refreshToken, expiryDate } = await getTokensFromConvex(userId);
  if (!accessToken || !refreshToken) {
    return res.status(403).json({ error: "User has not connected Google Calendar." });
  }

  // 4) Setup OAuth2 client
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL || "";

  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // 5) Refresh token if expired
  const now = Date.now();
  if (expiryDate && now >= expiryDate) {
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    try {
      const { credentials } = await oAuth2Client.refreshAccessToken();
      accessToken = credentials.access_token || accessToken;
      refreshToken = credentials.refresh_token || refreshToken;
      expiryDate = credentials.expiry_date || expiryDate;

      // Store updated tokens
      await storeTokensInConvex(userId, accessToken, refreshToken, expiryDate);
    } catch (err) {
      console.error("Failed to refresh access token:", err);
      return res.status(401).json({ error: "Refresh token invalid or expired." });
    }
  } else {
    // Not expired yet; just set current credentials
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate,
    });
  }

  // 6) Create the start/end Date objects
  // "YYYY-MM-DD" + "T" + "HH:MM:00"
  const startTime = new Date(`${date}T${time}:00`);
  // Example: 45 minutes for the meeting
  const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);

  // 7) Prepare a Calendar Event
  const event = {
    summary: "Scheduled Meeting",
    description: "Created via our API",
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "UTC", // or your user’s time zone
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "UTC",
    },
  };

  try {
    // 8) Insert event in the user’s Calendar
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    // Return the newly created event data
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ error: "Failed to schedule the meeting" });
  }
}