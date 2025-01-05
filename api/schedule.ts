// file: /api/scheduleOrUpdateMeeting.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google, calendar_v3 } from "googleapis";
import { fromZonedTime } from "date-fns-tz";

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

  // Ensure it's a POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2) Parse inputs from the POST body
  const {
    userId,
    patientId,
    userTimeZone,
    date, // "YYYY-MM-DD"
    time, // "HH:MM"
    calendarId = "primary",
    summary = "",
    description = "",
  } = req.body as {
    userId?: string;
    patientId?: string;
    userTimeZone?: string;
    date?: string;
    time?: string;
    calendarId?: string;
    summary?: string;
    description?: string;
  };

  if (!userId) return res.status(400).json({ error: "Missing userId" });
  if (!patientId) return res.status(400).json({ error: "Missing patientId" });
  if (!userTimeZone) return res.status(400).json({ error: "Missing timezone" });
  if (!date)
    return res.status(400).json({ error: "Missing date (YYYY-MM-DD)" });
  if (!time) return res.status(400).json({ error: "Missing time (HH:MM)" });

  // 3) Get tokens from your DB/Convex
  let { accessToken, refreshToken, expiryDate } =
    await getTokensFromConvex(userId);
  if (!accessToken || !refreshToken) {
    return res
      .status(403)
      .json({ error: "User has not connected Google Calendar." });
  }

  // 4) Create OAuth2 client and refresh if necessary (same as before)
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );

  const now = Date.now();
  if (expiryDate && now >= expiryDate) {
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    try {
      const { credentials } = await oAuth2Client.refreshAccessToken();
      accessToken = credentials.access_token || accessToken;
      refreshToken = credentials.refresh_token || refreshToken;
      expiryDate = credentials.expiry_date || expiryDate;

      await storeTokensInConvex(userId, accessToken, refreshToken, expiryDate);
    } catch (err) {
      console.error("Failed to refresh access token:", err);
      return res
        .status(401)
        .json({ error: "Refresh token invalid or expired." });
    }
  } else {
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate,
    });
  }

  // 5) Construct start/end times and prepare event data
  const startTime = fromZonedTime(`${date}T${time}:00`, userTimeZone); // Convert to tz
  const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);

  const eventPayload: calendar_v3.Schema$Event = {
    summary,
    description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: userTimeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: userTimeZone,
    },
    extendedProperties: {
      private: {
        patientId,
      },
    },
  };

  // 6) Handle scheduling or updating (same logic as before)
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  try {
    const listParams: calendar_v3.Params$Resource$Events$List = {
      calendarId,
      timeMin: new Date().toISOString(),
      privateExtendedProperty: [`patientId=${patientId}`],
      singleEvents: true,
      orderBy: "startTime",
    };

    const listResponse = await calendar.events.list(listParams);
    const existingEvents = listResponse.data.items || [];

    if (existingEvents.length > 0) {
      const eventId = existingEvents[0].id!;
      const patchParams: calendar_v3.Params$Resource$Events$Patch = {
        calendarId,
        eventId,
        requestBody: eventPayload,
      };
      const updateResponse = await calendar.events.patch(patchParams);
      return res
        .status(200)
        .json({ action: "updated", updatedEvent: updateResponse.data });
    } else {
      const insertParams: calendar_v3.Params$Resource$Events$Insert = {
        calendarId,
        requestBody: eventPayload,
      };
      const createResponse = await calendar.events.insert(insertParams);
      return res
        .status(200)
        .json({ action: "created", createdEvent: createResponse.data });
    }
  } catch (error) {
    console.error("Error scheduling/editing event:", error);
    return res
      .status(500)
      .json({ error: "Failed to schedule or update the meeting." });
  }
}
