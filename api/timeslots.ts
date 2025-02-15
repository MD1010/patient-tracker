// api/timeslots.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
// import { handleCORS } from '../lib/cors';

function handleCORS(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true; // Indicates CORS preflight was handled
  }

  return false; // Indicates request should proceed
}

// Reuse the same approach to call your Convex queries
async function getTokensFromConvex(userId: string) {
  const response = await fetch(
    process.env.CONVEX_ACTIONS_URL + "/api/getGoogleTokens",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CONVEX_AUTH_TOKEN}`,
      },
      body: JSON.stringify({ userId }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tokens from Convex");
  }
  return response.json() as Promise<{
    accessToken?: string;
    refreshToken?: string;
    expiryDate?: number;
  }>;
}

async function storeTokensInConvex(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiryDate: number
) {
  // same approach as before
  const response = await fetch(
    process.env.CONVEX_ACTIONS_URL + "/api/storeGoogleTokens",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CONVEX_AUTH_TOKEN}`,
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

/** Helper: Convert HH:MM -> total minutes from midnight */
function toMinutes(hhmm: string): number {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + (mm || 0);
}

/**
 * Finds free timeslots where each slot is exactly `duration` minutes long.
 * Example: if `duration = 45`, you might get slots like "07:00", "08:45", "09:30".
 */
function findFreeTimes(
  events: Array<{ start: number; end: number; isSystemScheduled: boolean }>,
  startInMins: number,
  endInMins: number,
  duration = 45,
): string[] {
  const freeSlots: string[] = [];
  let pointer = startInMins;

  // Handle all events consistently with timezone
  events.forEach((evt) => {
    if (evt.isSystemScheduled) {
      // Since evt.start is already in minutes from midnight, just format it directly
      const hh = String(Math.floor(evt.start / 60)).padStart(2, "0");
      const mm = String(evt.start % 60).padStart(2, "0");
      freeSlots.push(`${hh}:${mm}`);
    }
  });

  while (pointer + duration <= endInMins) {
    const pointerEnd = pointer + duration;

    const hasOverlap = events.some((evt) => {
      if (evt.isSystemScheduled) return false;
      return evt.start < pointerEnd && evt.end > pointer;
    });

    if (!hasOverlap) {
      const hh = String(Math.floor(pointer / 60)).padStart(2, "0");
      const mm = String(pointer % 60).padStart(2, "0");
      freeSlots.push(`${hh}:${mm}`);
    }

    pointer += 15;
  }

  return [...new Set(freeSlots)].sort();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const {
    patientId,
    userId,
    date,
    startOfDay = "07:00",
    endOfDay = "20:15",
    duration = "45",
    calendarId = "primary",
    userTimeZone = 'Asia/Jerusalem'
  } = req.query as {
    userId?: string;
    patientId?: string;
    date?: string;
    startOfDay?: string;
    endOfDay?: string;
    duration?: string;
    calendarId?: string;
    userTimeZone?: string;
  };

  if (handleCORS(req, res)) return; // Handle CORS and terminate if it's a preflight

  if (!userId) {
    return res.status(400).json({ error: "Missing userId param" });
  }
  if (!patientId) {
    return res.status(400).json({ error: "Missing patientId param" });
  }
  if (!date) {
    return res.status(400).json({ error: "Missing date param (YYYY-MM-DD)" });
  }

  // 1) Get the user's tokens from Convex
  let { accessToken, refreshToken, expiryDate } =
    await getTokensFromConvex(userId);

  if (!accessToken || !refreshToken) {
    return res
      .status(403)
      .json({ error: "User has not connected Google Calendar." });
  }

  // 2) Create OAuth2 client
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  // 3) Check if access token is expired
  const now = Date.now();
  if (expiryDate && now >= expiryDate) {
    // Need to refresh
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
      return res
        .status(401)
        .json({ error: "Refresh token invalid or expired." });
    }
  } else {
    // Not expired yet; just set credentials
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate,
    });
  }

  // 4) Now call Google Calendar for events
  try {
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    
    // Use the date directly without timezone offset
    const minTime = `${date}T00:00:00Z`;
    const maxTime = `${date}T23:59:59Z`;
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: minTime,
      timeMax: maxTime,
      singleEvents: true,
      orderBy: "startTime",
      timeZone: userTimeZone, // Google Calendar API will handle the timezone conversion
    });

    const items = response.data.items || [];
    const events = items.map((evt) => {
      const startDateTime = evt.start?.dateTime || evt.start?.date;
      const endDateTime = evt.end?.dateTime || evt.end?.date;
      
      if (!startDateTime || !endDateTime) return null;

      // Parse the dates and force them into the user's timezone
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      // Get time in user's timezone
      const startTimeStr = startDate.toLocaleTimeString('en-US', {
        timeZone: userTimeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      const endTimeStr = endDate.toLocaleTimeString('en-US', {
        timeZone: userTimeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });

      // Convert HH:MM to minutes
      const [startHH, startMM] = startTimeStr.split(':').map(Number);
      const [endHH, endMM] = endTimeStr.split(':').map(Number);

      return {
        start: startHH * 60 + startMM,
        end: endHH * 60 + endMM,
        isSystemScheduled: !!(evt.extendedProperties?.private?.patientId === patientId),
      };
    }).filter(Boolean) as Array<{ start: number; end: number; isSystemScheduled: boolean }>;

    const startInMins = toMinutes(startOfDay);
    const endInMins = toMinutes(endOfDay);

    const freeSlots = findFreeTimes(
      events,
      startInMins,
      endInMins,
      Number(duration),
    );
    
    return res.status(200).json(freeSlots);
  } catch (error) {
    console.error("Calendar error:", error);
    return res.status(500).json({ error: "Failed to retrieve calendar events." });
  }
}
