// file: /api/scheduleOrUpdateMeeting.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google, calendar_v3 } from "googleapis";

/** Example: Minimal CORS handler. */
function handleCORS(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

/** Example: Stub function that returns tokens. Implement your actual DB/Convex logic. */
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

/** Example: Stub function that stores tokens. */
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
  // 1) Handle CORS
  if (handleCORS(req, res)) return;

  // 2) Parse inputs (from query or body). Adjust to your use case.
  const {
    userId,
    patientId,
    date,        // "YYYY-MM-DD"
    time,        // "HH:MM"
    calendarId = "primary",
    summary = "",
    description = "",
  } = req.query as {
    userId?: string;
    patientId?: string;
    date?: string;
    time?: string;
    calendarId?: string;
    summary?: string;
    description?: string;
  };

  if (!userId) return res.status(400).json({ error: "Missing userId" });
  if (!patientId) return res.status(400).json({ error: "Missing patientId" });
  if (!date) return res.status(400).json({ error: "Missing date (YYYY-MM-DD)" });
  if (!time) return res.status(400).json({ error: "Missing time (HH:MM)" });

  // 3) Get tokens from your DB/Convex
  let { accessToken, refreshToken, expiryDate } = await getTokensFromConvex(userId);
  if (!accessToken || !refreshToken) {
    return res.status(403).json({ error: "User has not connected Google Calendar." });
  }

  // 4) Create OAuth2
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );

  // 5) Refresh if expired
  const now = Date.now();
  if (expiryDate && now >= expiryDate) {
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    try {
      // This returns a promise => no TS error about 'await' usage
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
    // Not expired; set current credentials
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate,
    });
  }

  // 6) Construct start/end times (45 min default)
  const startTime = new Date(`${date}T${time}:00`);
  const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);

  // 7) Prepare event data
  const eventPayload: calendar_v3.Schema$Event = {
    summary,
    description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "UTC",
    },
    extendedProperties: {
      private: {
        patientId, // So we can find this user's future event
      },
    },
  };

  // 8) Create a typed Calendar client
  const calendar = google.calendar({
    version: "v3",
    auth: oAuth2Client,
  });

  try {
    // 9) Look for existing future events with the same userId
    const listParams: calendar_v3.Params$Resource$Events$List = {
      calendarId,
      timeMin: new Date().toISOString(),          // from now onward
      privateExtendedProperty: [`patientId=${patientId}`], // MUST be an array of strings
      singleEvents: true,
      orderBy: "startTime",
    };

    const listResponse = await calendar.events.list(listParams);
    const existingEvents = listResponse.data.items || [];

    if (existingEvents.length > 0) {
      // 9a) Update the first existing future event
      const eventId = existingEvents[0].id!;
      const patchParams: calendar_v3.Params$Resource$Events$Patch = {
        calendarId,
        eventId,
        requestBody: eventPayload,
      };
      // .patch returns a promise => no TS 'await' complaint
      const updateResponse = await calendar.events.patch(patchParams);

      return res.status(200).json({
        action: "updated",
        updatedEvent: updateResponse.data,
      });
    } else {
      // 9b) Create a new event
      const insertParams: calendar_v3.Params$Resource$Events$Insert = {
        calendarId,
        requestBody: eventPayload,
      };
      const createResponse = await calendar.events.insert(insertParams);

      return res.status(200).json({
        action: "created",
        createdEvent: createResponse.data,
      });
    }
  } catch (error) {
    console.error("Error scheduling/editing event:", error);
    return res.status(500).json({ error: "Failed to schedule or update the meeting." });
  }
}