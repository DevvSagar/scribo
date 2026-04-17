import { google } from "googleapis";
import {
  getValidOAuthClient,
  listUpcomingCalendarEvents,
  serializeExternalMeeting,
} from "./googleCalendar.js";
import logger from "./logger.js";

const CACHE_DURATION_MS = 30 * 1000;
const externalMeetingsCache = new Map();

export const invalidateUserCache = (userId) => {
  externalMeetingsCache.delete(userId.toString());
};

export const getExternalMeetingsForUser = async (userId) => {
  const cacheKey = userId.toString();
  const cached = externalMeetingsCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  const auth = await getValidOAuthClient(userId);
  const calendar = google.calendar({ version: "v3", auth });
  const events = await listUpcomingCalendarEvents(calendar, {
    timeMin: new Date(),
    maxResults: 10,
    userId: cacheKey,
  });

  const meetings = events
    .map(serializeExternalMeeting)
    .filter(
      (meeting) =>
        !Number.isNaN(new Date(meeting.startTime).getTime()) &&
        !Number.isNaN(new Date(meeting.endTime).getTime()),
    )
    .sort(
      (left, right) =>
        new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
    );

  externalMeetingsCache.set(cacheKey, {
    data: meetings,
    timestamp: Date.now(),
  });
  logger.info("Google Calendar cache refreshed", {
    userId: cacheKey,
    eventCount: meetings.length,
  });

  return meetings;
};
