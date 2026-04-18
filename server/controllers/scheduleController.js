import jwt from "jsonwebtoken";
import validator from "validator";
import mongoose from "mongoose";
import ScheduledMeeting from "../models/ScheduledMeeting.js";
import GoogleCalendarToken from "../models/GoogleCalendarToken.js";
import { createHttpError } from "../utils/httpErrors.js";
import {
  buildConferenceRequestId,
  buildGoogleAuthUrl,
  DEMO_CALENDAR_USER_ID,
  exchangeGoogleCode,
  extractMeetingLink,
  getCalendarTokenRecordForUser,
  getValidOAuthClient,
} from "../utils/googleCalendar.js";
import { encryptSecret } from "../utils/encryption.js";
import { google } from "googleapis";
import {
  getExternalMeetingsForUser,
  invalidateUserCache,
} from "../utils/googleSyncService.js";
import logger from "../utils/logger.js";

const FRONTEND_URL = process.env.FRONTEND_URL;
const GOOGLE_CALLBACK_STATE_TTL = "10m";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const ALLOWED_PLATFORMS = new Set(["gmeet", "zoom", "teams"]);
const MAX_SCHEDULE_DESCRIPTION_LENGTH = 2000;
const DEMO_USER_ID = DEMO_CALENDAR_USER_ID;
const DEFAULT_FRONTEND_FALLBACK = "http://localhost:5173";
const SCHEDULER_TIME_ZONE = "Asia/Kolkata";

const normalizeFrontendOrigin = (value) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }

  try {
    const url = new URL(value.trim());

    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    return url.origin;
  } catch {
    return "";
  }
};

const getFrontendOriginFromRequest = (req) => {
  const originHeader = normalizeFrontendOrigin(req.get("origin"));

  if (originHeader) {
    return originHeader;
  }

  const refererHeader = req.get("referer");

  if (typeof refererHeader === "string" && refererHeader.trim().length > 0) {
    return normalizeFrontendOrigin(refererHeader);
  }

  return "";
};

const getFrontendRedirectBase = (req, statePayload = {}) =>
  normalizeFrontendOrigin(statePayload.frontendOrigin) ||
  getFrontendOriginFromRequest(req) ||
  normalizeFrontendOrigin(FRONTEND_URL) ||
  DEFAULT_FRONTEND_FALLBACK;

const buildFrontendScheduleRedirectUrl = (req, statePayload, status) =>
  `${getFrontendRedirectBase(req, statePayload)}/dashboard/schedule?google=${status}`;

const sanitizeText = (value, { maxLength = 2000, fallback = "" } = {}) => {
  if (typeof value !== "string") return fallback;
  return validator.escape(validator.trim(value)).slice(0, maxLength);
};

const sanitizeUrl = (value, { maxLength = 1000 } = {}) => {
  if (typeof value !== "string") return "";
  return validator.trim(value).slice(0, maxLength);
};

const sanitizeTimeZone = (value) => {
  if (typeof value !== "string") {
    return SCHEDULER_TIME_ZONE;
  }

  const timeZone = validator.trim(value);

  if (!timeZone) {
    return SCHEDULER_TIME_ZONE;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return timeZone === "Asia/Calcutta" ? SCHEDULER_TIME_ZONE : timeZone;
  } catch {
    return SCHEDULER_TIME_ZONE;
  }
};

const sanitizeLocalDateTime = (value, label) => {
  if (typeof value !== "string") {
    throw createHttpError(400, `${label} must be a valid local date and time.`);
  }

  const trimmed = validator.trim(value);

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    throw createHttpError(400, `${label} must be a valid local date and time.`);
  }

  return `${trimmed}:00`;
};

const normalizeAttendees = (value) => {
  if (!Array.isArray(value)) {
    throw createHttpError(400, "Attendees must be provided as an array of emails.");
  }

  const uniqueEmails = new Set();

  for (const attendee of value) {
    if (typeof attendee !== "string") {
      throw createHttpError(400, "Each attendee must be a valid email address.");
    }

    const email = validator.normalizeEmail(attendee.trim(), {
      all_lowercase: true,
      gmail_remove_dots: false,
    });

    if (!email || !validator.isEmail(email)) {
      throw createHttpError(400, "Each attendee must be a valid email address.");
    }

    uniqueEmails.add(email);
  }

  return Array.from(uniqueEmails);
};

const parseMeetingPayload = (body) => {
  const title = sanitizeText(body.title, { maxLength: 120 });
  const description = sanitizeText(body.description, {
    maxLength: MAX_SCHEDULE_DESCRIPTION_LENGTH,
  });
  const platform = sanitizeText(body.platform, { maxLength: 20 }).toLowerCase();
  const meetingLink = sanitizeUrl(body.meetingLink, { maxLength: 1000 });
  const timeZone = sanitizeTimeZone(body.timeZone);
  const startTimeLocal = sanitizeLocalDateTime(body.startTime, "Start time");
  const endTimeLocal = sanitizeLocalDateTime(body.endTime, "End time");
  const startTime = new Date(body.startTimeIso || body.startTime);
  const endTime = new Date(body.endTimeIso || body.endTime);
  const attendees = normalizeAttendees(body.attendees || []);

  if (title.length < 3) {
    throw createHttpError(400, "Title must be at least 3 characters long.");
  }

  if (!ALLOWED_PLATFORMS.has(platform)) {
    throw createHttpError(400, "Platform is invalid.");
  }

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw createHttpError(400, "Start time and end time must be valid dates.");
  }

  if (startTime <= new Date()) {
    throw createHttpError(400, "Start time must be in the future.");
  }

  if (endTime <= startTime) {
    throw createHttpError(400, "End time must be later than start time.");
  }

  if (attendees.length > 50) {
    throw createHttpError(400, "A maximum of 50 attendees is allowed per meeting.");
  }

  if (platform !== "gmeet") {
    if (!meetingLink) {
      throw createHttpError(400, "Meeting link is required for Zoom and Teams meetings.");
    }

    if (!validator.isURL(meetingLink, { protocols: ["https"], require_protocol: true })) {
      throw createHttpError(400, "Meeting link must be a valid HTTPS URL.");
    }
  }

  return {
    title,
    description,
    meetingType: "personal",
    platform,
    meetingLink,
    timeZone,
    startTimeLocal,
    endTimeLocal,
    startTime,
    endTime,
    attendees,
  };
};

const getPagination = (query) => {
  const page = Math.max(
    DEFAULT_PAGE,
    Number.parseInt(query.page || `${DEFAULT_PAGE}`, 10) || DEFAULT_PAGE,
  );
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      Number.parseInt(query.limit || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT,
    ),
  );

  return { page, limit, skip: (page - 1) * limit };
};

const buildMeetingStatus = (meeting) =>
  new Date(meeting.endTime) < new Date() ? "completed" : "upcoming";

const toUtcISOString = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const serializeInternalMeeting = (meeting) => ({
  id: meeting._id.toString(),
  title: meeting.title,
  description: meeting.description,
  source: meeting.source || "internal",
  meetingType: meeting.meetingType,
  platform: meeting.platform,
  startTime: toUtcISOString(meeting.startTime),
  endTime: toUtcISOString(meeting.endTime),
  attendees: meeting.attendees,
  meetingLink: meeting.meetingLink || "",
  calendarEventId: meeting.calendarEventId,
  createdAt: toUtcISOString(meeting.createdAt),
  reminderSent: Boolean(meeting.reminderSent),
  status: buildMeetingStatus(meeting),
});

const sortByNearestStart = (left, right) =>
  new Date(left.startTime).getTime() - new Date(right.startTime).getTime();

const dedupeExternalMeetings = (internalMeetings, externalMeetings) => {
  const internalCalendarEventIds = new Set(
    internalMeetings
      .map((meeting) => meeting.calendarEventId)
      .filter((calendarEventId) => typeof calendarEventId === "string" && calendarEventId.length > 0),
  );

  return externalMeetings.filter(
    (meeting) =>
      !meeting.calendarEventId || !internalCalendarEventIds.has(meeting.calendarEventId),
  );
};

const mapGoogleCalendarError = (
  error,
  fallbackMessage = "Google Calendar is temporarily unavailable.",
) => {
  if (error?.statusCode) {
    return error;
  }

  const status = error?.code || error?.response?.status;

  if (status === 401 || status === 403) {
    return createHttpError(401, "GOOGLE_REAUTH_REQUIRED");
  }

  return createHttpError(502, fallbackMessage);
};

const getOAuthUserId = (req) => req.user?._id || DEMO_USER_ID;

const storeGoogleTokens = async (userId, tokens) => {
  const accessToken = tokens.access_token;
  const refreshToken = tokens.refresh_token;
  const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

  if (!accessToken) {
    throw createHttpError(502, "Google did not return an access token.");
  }

  await GoogleCalendarToken.findOneAndUpdate(
    { userId },
    {
      userId,
      encryptedAccessToken: encryptSecret(accessToken),
      ...(refreshToken
        ? { encryptedRefreshToken: encryptSecret(refreshToken) }
        : {}),
      scope: tokens.scope || "",
      expiryDate,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
};

export const getGoogleConnectionStatus = async (req, res, next) => {
  try {
    const tokenRecord = await getCalendarTokenRecordForUser(req.user._id);

    res.json({
      connected: Boolean(tokenRecord),
      email: tokenRecord?.email || "",
      expiryDate: tokenRecord?.expiryDate || null,
      updatedAt: tokenRecord?.updatedAt || null,
    });
  } catch (error) {
    next(error);
  }
};

export const connectGoogleCalendar = async (req, res, next) => {
  try {
    const state = jwt.sign(
      {
        userId: getOAuthUserId(req).toString(),
        provider: "google-calendar",
        frontendOrigin: getFrontendOriginFromRequest(req) || normalizeFrontendOrigin(FRONTEND_URL),
      },
      process.env.JWT_SECRET,
      { expiresIn: GOOGLE_CALLBACK_STATE_TTL },
    );
    const authUrl = buildGoogleAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

export const disconnectGoogleCalendar = async (req, res, next) => {
  try {
    const tokenRecord = await getCalendarTokenRecordForUser(req.user._id);

    if (tokenRecord) {
      await GoogleCalendarToken.deleteOne({ userId: tokenRecord.userId });
    }

    invalidateUserCache(req.user._id);

    res.json({ message: "Google Calendar disconnected successfully." });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleCalendarCallback = async (req, res, _next) => {
  try {
    logger.info("Google OAuth callback received.", {
      queryKeys: Object.keys(req.query || {}),
      hasCode: typeof req.query.code === "string" && req.query.code.length > 0,
      hasState:
        typeof req.query.state === "string" && req.query.state.length > 0,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || "",
    });

    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";

    if (!code || !state) {
      throw createHttpError(400, "Google OAuth callback is missing required parameters.");
    }

    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const oauthUserId = getOAuthUserId(req);

    if (
      decoded.provider !== "google-calendar" ||
      decoded.userId !== oauthUserId.toString()
    ) {
      throw createHttpError(403, "Google OAuth state is invalid.");
    }

    const { client, tokens } = await exchangeGoogleCode(code);
    logger.info("Google OAuth token exchange completed.", {
      userId: oauthUserId.toString(),
      hasAccessToken: Boolean(tokens?.access_token),
      hasRefreshToken: Boolean(tokens?.refresh_token),
      hasExpiryDate: Boolean(tokens?.expiry_date),
      scope: tokens?.scope || "",
    });

    try {
      await storeGoogleTokens(oauthUserId, tokens);
    } catch (error) {
      logger.error("Google OAuth token persistence failed.", {
        userId: oauthUserId.toString(),
        message: error.message,
      });
    }

    // Token exchange is enough to consider the Google connection successful.
    // Keep account email lookup out of the critical path so OAuth connect does
    // not fail when Google userinfo is unavailable or rejects the request.

    return res.redirect(buildFrontendScheduleRedirectUrl(req, decoded, "success"));
  } catch (error) {
    logger.error("Google Calendar OAuth callback failed.", {
      message: error.message,
      stack: error.stack,
    });
    return res.redirect(buildFrontendScheduleRedirectUrl(req, {}, "error"));
  }
};

export const createScheduledMeeting = async (req, res, next) => {
  try {
    const payload = parseMeetingPayload(req.body);
    let meetingLink = payload.meetingLink;
    let calendarEventId = "";

    if (payload.platform === "gmeet") {
      try {
        const auth = await getValidOAuthClient(req.user._id);
        const calendar = google.calendar({ version: "v3", auth });

        const calendarResponse = await calendar.events.insert({
          calendarId: "primary",
          conferenceDataVersion: 1,
          sendUpdates: "all",
          requestBody: {
            summary: payload.title,
            description: payload.description,
            start: {
              dateTime: payload.startTimeLocal,
              timeZone: payload.timeZone,
            },
            end: {
              dateTime: payload.endTimeLocal,
              timeZone: payload.timeZone,
            },
            attendees: payload.attendees.map((email) => ({ email })),
            conferenceData: {
              createRequest: {
                requestId: buildConferenceRequestId(),
                conferenceSolutionKey: {
                  type: "hangoutsMeet",
                },
              },
            },
            extendedProperties: {
              private: {
                scriboMeetingType: payload.meetingType,
                scriboSource: "internal",
              },
            },
          },
        });

        const event = calendarResponse.data;
        meetingLink = extractMeetingLink(event);
        calendarEventId = event.id || "";

        if (!meetingLink || !calendarEventId) {
          throw createHttpError(502, "Google Calendar did not return a meeting link.");
        }
      } catch (error) {
        throw mapGoogleCalendarError(
          error,
          "Unable to create the Google Meet event right now.",
        );
      }
    }

    const meeting = await ScheduledMeeting.create({
      userId: req.user._id,
      source: "internal",
      title: payload.title,
      description: payload.description,
      meetingType: payload.meetingType,
      platform: payload.platform,
      startTime: payload.startTime,
      endTime: payload.endTime,
      attendees: payload.attendees,
      meetingLink,
      calendarEventId,
      reminderSent: false,
    });

    invalidateUserCache(req.user._id);

    res.status(201).json({ meeting: serializeInternalMeeting(meeting) });
  } catch (error) {
    next(error);
  }
};

export const getMyScheduledMeetings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const statusFilter = sanitizeText(req.query.status || "", { maxLength: 20 }).toLowerCase();
    const query = { userId: req.user._id, source: "internal" };
    const now = new Date();

    if (statusFilter === "upcoming") {
      query.endTime = { $gte: now };
    } else if (statusFilter === "completed") {
      query.endTime = { $lt: now };
    }

    const [meetings, total] = await Promise.all([
      ScheduledMeeting.find(query)
        .sort({ startTime: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ScheduledMeeting.countDocuments(query),
    ]);

    res.json({
      meetings: meetings.map(serializeInternalMeeting),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSyncedMeetings = async (req, res, next) => {
  try {
    const statusFilter = sanitizeText(req.query.status || "upcoming", {
      maxLength: 20,
    }).toLowerCase();
    const internalQuery = { userId: req.user._id, source: "internal" };
    const now = new Date();

    if (statusFilter === "completed") {
      internalQuery.endTime = { $lt: now };
    } else {
      internalQuery.endTime = { $gte: now };
    }

    const internalMeetings = (
      await ScheduledMeeting.find(internalQuery).sort({ startTime: 1, createdAt: -1 })
    ).map(serializeInternalMeeting);

    let externalMeetings = [];
    let externalMeetingsError = "";

    if (statusFilter !== "completed") {
      try {
        externalMeetings = await getExternalMeetingsForUser(req.user._id);
        externalMeetings = dedupeExternalMeetings(internalMeetings, externalMeetings);
      } catch (error) {
        if (error.statusCode === 400) {
          externalMeetings = [];
        } else if (error.statusCode === 401) {
          externalMeetings = [];
          externalMeetingsError = "GOOGLE_REAUTH_REQUIRED";
        } else {
          logger.error("External meetings fetch failed", {
            userId: req.user._id.toString(),
            message: error.message,
          });
          externalMeetings = [];
          externalMeetingsError = "Google Calendar meetings are temporarily unavailable.";
        }
      }
    }

    res.json({
      meetings: [...internalMeetings, ...externalMeetings].sort(sortByNearestStart),
      internalMeetings,
      externalMeetings,
      externalMeetingsError,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScheduledMeeting = async (req, res, next) => {
  try {
    const meetingId = typeof req.params.id === "string" ? req.params.id.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      throw createHttpError(400, "Meeting id is invalid.");
    }

    const meeting = await ScheduledMeeting.findOne({
      _id: meetingId,
      userId: req.user._id,
      source: "internal",
    });

    if (!meeting) {
      throw createHttpError(404, "Scheduled meeting not found.");
    }

    if (meeting.platform === "gmeet" && meeting.calendarEventId) {
      try {
        const auth = await getValidOAuthClient(req.user._id);
        const calendar = google.calendar({ version: "v3", auth });

        await calendar.events.delete({
          calendarId: "primary",
          eventId: meeting.calendarEventId,
          sendUpdates: "all",
        });
      } catch (error) {
        if (error.code !== 404 && error.response?.status !== 404) {
          throw mapGoogleCalendarError(
            error,
            "Unable to delete the Google Calendar event right now.",
          );
        }
      }
    }

    await ScheduledMeeting.deleteOne({ _id: meeting._id, userId: req.user._id });
    res.json({ message: "Scheduled meeting deleted successfully." });
  } catch (error) {
    next(error);
  }
};
