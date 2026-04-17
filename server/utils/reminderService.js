import cron from "node-cron";
import ScheduledMeeting from "../models/ScheduledMeeting.js";
import User from "../models/User.js";
import { createEmailTransporter } from "./emailTransport.js";
import logger from "./logger.js";

let reminderTask;

const buildReminderWindow = () => {
  const nowMs = Date.now();
  const thirtyMinutesFromNowMs = nowMs + 30 * 60 * 1000;

  return {
    now: new Date(nowMs),
    thirtyMinutesFromNow: new Date(thirtyMinutesFromNowMs),
    nowMs,
    thirtyMinutesFromNowMs,
  };
};

const sendMeetingReminder = async (transporter, { userEmail, meeting }) => {
  const formattedTime = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(meeting.startTime));

  await transporter.sendMail({
    from: `"Scribo Reminders" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Reminder: ${meeting.title} starts in 30 minutes`,
    text: [
      "Your meeting starts in 30 minutes.",
      "",
      `Title: ${meeting.title}`,
      `Time: ${formattedTime}`,
      `Platform: ${meeting.platform}`,
      meeting.meetingLink ? `Join link: ${meeting.meetingLink}` : "Join link: Not provided",
    ].join("\n"),
  });
};

const runReminderPass = async () => {
  const { now, thirtyMinutesFromNow, nowMs, thirtyMinutesFromNowMs } =
    buildReminderWindow();
  const candidateMeetings = await ScheduledMeeting.find({
    source: "internal",
    reminderSent: false,
    startTime: {
      $gte: now,
      $lte: thirtyMinutesFromNow,
    },
  }).lean();

  if (candidateMeetings.length === 0) {
    return;
  }

  const transporter = createEmailTransporter();

  for (const meeting of candidateMeetings) {
    try {
      const meetingTimeMs = new Date(meeting.startTime).getTime();

      if (
        Number.isNaN(meetingTimeMs) ||
        meetingTimeMs < nowMs ||
        meetingTimeMs > thirtyMinutesFromNowMs
      ) {
        continue;
      }

      const claim = await ScheduledMeeting.updateOne(
        { _id: meeting._id, reminderSent: false },
        {
          $set: {
            reminderSent: true,
            reminderSentAt: new Date(),
          },
        },
      );

      if (claim.modifiedCount !== 1) {
        continue;
      }

      const user = await User.findById(meeting.userId).select("email").lean();

      if (!user?.email) {
        await ScheduledMeeting.updateOne(
          { _id: meeting._id },
          { $set: { reminderSentAt: null, reminderSent: false } },
        );
        continue;
      }

      await sendMeetingReminder(transporter, {
        userEmail: user.email,
        meeting,
      });
      logger.info("Reminder sent", {
        meetingId: meeting._id?.toString(),
        userId: meeting.userId?.toString(),
      });
    } catch (error) {
      await ScheduledMeeting.updateOne(
        { _id: meeting._id },
        { $set: { reminderSentAt: null, reminderSent: false } },
      );
      logger.error("Reminder failed", {
        meetingId: meeting._id?.toString(),
        userId: meeting.userId?.toString(),
        message: error.message,
      });
    }
  }
};

export const startReminderService = () => {
  if (reminderTask) {
    return reminderTask;
  }

  reminderTask = cron.schedule("*/5 * * * *", async () => {
    try {
      await runReminderPass();
    } catch (error) {
      logger.error("Reminder cron pass failed", {
        message: error.message,
      });
    }
  });

  return reminderTask;
};
