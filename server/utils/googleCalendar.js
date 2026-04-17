import crypto from "crypto";
import mongoose from "mongoose";
import { google } from "googleapis";
import GoogleCalendarToken from "../models/GoogleCalendarToken.js";
import { decryptSecret, encryptSecret } from "./encryption.js";
import { createHttpError } from "./httpErrors.js";
import logger from "./logger.js";

export const DEMO_CALENDAR_USER_ID = new mongoose.Types.ObjectId(
  "000000000000000000000001",
);
export const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar";
export const GOOGLE_USERINFO_EMAIL_SCOPE =
  "https://www.googleapis.com/auth/userinfo.email";

const getGoogleConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw createHttpError(
      500,
      "Google Calendar integration is not configured on the server.",
    );
  }

  return { clientId, clientSecret, redirectUri };
};

export const createOAuthClient = () => {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const buildGoogleAuthUrl = (state) => {
  const client = createOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GOOGLE_CALENDAR_SCOPE, GOOGLE_USERINFO_EMAIL_SCOPE],
    state,
  });
};

export const exchangeGoogleCode = async (code) => {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  return { client, tokens };
};

export const createCalendarClient = (tokens) => {
  const client = createOAuthClient();
  client.setCredentials(tokens);
  return {
    client,
    calendar: google.calendar({ version: "v3", auth: client }),
  };
};

const getTokensFromRecord = (record) => ({
  access_token: record.encryptedAccessToken
    ? decryptSecret(record.encryptedAccessToken)
    : undefined,
  refresh_token: record.encryptedRefreshToken
    ? decryptSecret(record.encryptedRefreshToken)
    : undefined,
  expiry_date: record.expiryDate?.getTime(),
});

const persistGoogleTokens = async (userId, tokens) => {
  if (!tokens?.access_token && !tokens?.refresh_token && !tokens?.expiry_date) {
    return;
  }

  const existingRecord = await GoogleCalendarToken.findOne({ userId })
    .select("encryptedRefreshToken")
    .lean();

  const update = {};

  if (tokens.access_token) {
    update.encryptedAccessToken = encryptSecret(tokens.access_token);
  }

  if (tokens.refresh_token) {
    update.encryptedRefreshToken = encryptSecret(tokens.refresh_token);
  } else if (existingRecord?.encryptedRefreshToken) {
    update.encryptedRefreshToken = existingRecord.encryptedRefreshToken;
  }

  if (typeof tokens.scope === "string") {
    update.scope = tokens.scope;
  }

  if (tokens.expiry_date) {
    update.expiryDate = new Date(tokens.expiry_date);
  }

  if (Object.keys(update).length === 0) {
    return;
  }

  await GoogleCalendarToken.updateOne({ userId }, { $set: update });
};

const createGoogleReauthError = () =>
  createHttpError(401, "GOOGLE_REAUTH_REQUIRED");

const toUtcISOString = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

export const getCalendarTokenRecordForUser = async (userId) => {
  const primaryRecord = await GoogleCalendarToken.findOne({ userId });

  if (primaryRecord) {
    return primaryRecord;
  }

  if (userId?.toString() === DEMO_CALENDAR_USER_ID.toString()) {
    return null;
  }

  return GoogleCalendarToken.findOne({ userId: DEMO_CALENDAR_USER_ID });
};

export const getValidOAuthClient = async (userId) => {
  const tokenRecord = await getCalendarTokenRecordForUser(userId);

  if (!tokenRecord) {
    throw createHttpError(
      400,
      "Connect Google Calendar before using Google Calendar sync.",
    );
  }

  const tokenOwnerId = tokenRecord.userId;

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(getTokensFromRecord(tokenRecord));

  oauth2Client.on("tokens", async (tokens) => {
    try {
      await persistGoogleTokens(tokenOwnerId, tokens);
      logger.info("Token refreshed", { userId: tokenOwnerId.toString() });
    } catch (error) {
      logger.error("Token refresh persistence failed", {
        userId: tokenOwnerId.toString(),
        message: error.message,
      });
    }
  });

  const expiresAt = tokenRecord.expiryDate?.getTime() || 0;
  const isExpired = !expiresAt || expiresAt <= Date.now() + 60 * 1000;

  if (isExpired) {
    if (!oauth2Client.credentials.refresh_token) {
      logger.warn("Google refresh token missing", {
        userId: tokenOwnerId.toString(),
      });
      throw createGoogleReauthError();
    }

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials({
        ...oauth2Client.credentials,
        ...credentials,
      });
      await persistGoogleTokens(tokenOwnerId, {
        ...credentials,
        refresh_token:
          credentials.refresh_token || oauth2Client.credentials.refresh_token,
      });
      logger.info("Token refresh success", { userId: tokenOwnerId.toString() });
    } catch (error) {
      logger.warn("Token refresh failed", {
        userId: tokenOwnerId.toString(),
        status: error?.code || error?.response?.status || null,
        message: error.message,
      });
      throw createGoogleReauthError();
    }
  }

  return oauth2Client;
};

export const buildConferenceRequestId = () =>
  crypto.randomUUID().replace(/-/g, "");

const MEET_REGEX = /https:\/\/meet\.google\.com\/[a-z-]+/i;
const ZOOM_REGEX = /https:\/\/[\w.-]*zoom\.us\/[^\s)]+/i;
const TEAMS_REGEX = /https:\/\/teams\.microsoft\.com\/[^\s)]+/i;

const pickFirstMatch = (value = "", pattern) => {
  if (typeof value !== "string") return "";
  const match = value.match(pattern);
  return match ? match[0] : "";
};

export const inferMeetingPlatform = (event) => {
  const conferenceName =
    event?.conferenceData?.conferenceSolution?.name?.toLowerCase() || "";
  const location = typeof event?.location === "string" ? event.location : "";
  const description = typeof event?.description === "string" ? event.description : "";
  const sourceText = `${location}\n${description}`.toLowerCase();

  if (
    event?.hangoutLink ||
    conferenceName.includes("google meet") ||
    MEET_REGEX.test(sourceText)
  ) {
    return "gmeet";
  }

  if (conferenceName.includes("zoom") || ZOOM_REGEX.test(sourceText)) {
    return "zoom";
  }

  if (
    conferenceName.includes("teams") ||
    conferenceName.includes("microsoft") ||
    TEAMS_REGEX.test(sourceText)
  ) {
    return "teams";
  }

  return "";
};

export const extractMeetingLink = (event) => {
  const entryPoints = Array.isArray(event?.conferenceData?.entryPoints)
    ? event.conferenceData.entryPoints
    : [];
  const videoEntry = entryPoints.find((entry) => entry.entryPointType === "video");

  if (event?.hangoutLink) return event.hangoutLink;
  if (videoEntry?.uri) return videoEntry.uri;

  const location = typeof event?.location === "string" ? event.location : "";
  const description = typeof event?.description === "string" ? event.description : "";

  return (
    pickFirstMatch(location, MEET_REGEX) ||
    pickFirstMatch(description, MEET_REGEX) ||
    pickFirstMatch(location, ZOOM_REGEX) ||
    pickFirstMatch(description, ZOOM_REGEX) ||
    pickFirstMatch(location, TEAMS_REGEX) ||
    pickFirstMatch(description, TEAMS_REGEX) ||
    ""
  );
};

export const listUpcomingCalendarEvents = async (
  calendar,
  { timeMin = new Date(), maxResults = 10, userId } = {},
) => {
  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults,
      conferenceDataVersion: 1,
    });

    const items = Array.isArray(response.data?.items) ? response.data.items : [];
    logger.info("Google Calendar API call success", {
      userId: userId?.toString(),
      eventCount: items.length,
    });
    return items;
  } catch (error) {
    const status = error?.code || error?.response?.status;

    if (status === 401 || status === 403) {
      logger.warn("Google Calendar API reauth required", {
        userId: userId?.toString(),
        status,
        message: error.message,
      });
      throw createGoogleReauthError();
    }

    logger.error("Google Calendar API call failed", {
      userId: userId?.toString(),
      status: status || null,
      message: error.message,
    });
    throw error;
  }
};

export const serializeExternalMeeting = (event) => {
  const startTime = event.start?.dateTime || event.start?.date || "";
  const endTime = event.end?.dateTime || event.end?.date || "";
  const attendees = Array.isArray(event.attendees)
    ? event.attendees
        .map((attendee) => attendee?.email)
        .filter((email) => typeof email === "string" && email.length > 0)
    : [];
  const meetingLink = extractMeetingLink(event);

  return {
    id: `external-${event.id}`,
    title:
      typeof event.summary === "string" && event.summary.trim().length > 0
        ? event.summary.trim()
        : "Google Calendar event",
    startTime: toUtcISOString(startTime),
    endTime: toUtcISOString(endTime),
    meetingLink,
    attendees,
    platform: inferMeetingPlatform(event),
    source: "external",
    meetingType: "personal",
    calendarEventId: event.id || "",
    reminderSent: false,
    status: new Date(endTime) < new Date() ? "completed" : "upcoming",
  };
};
