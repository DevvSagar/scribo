import express from "express";
import rateLimit from "express-rate-limit";
import authMiddleware from "../middleware/auth.js";
import {
  connectGoogleCalendar,
  createScheduledMeeting,
  deleteScheduledMeeting,
  disconnectGoogleCalendar,
  getGoogleConnectionStatus,
  getMyScheduledMeetings,
  getSyncedMeetings,
  handleGoogleCalendarCallback,
} from "../controllers/scheduleController.js";

const router = express.Router();

const scheduleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many scheduler requests. Please wait a few minutes and try again.",
  },
});

router.use(scheduleLimiter);
router.use(authMiddleware);

router.get("/google/status", getGoogleConnectionStatus);
router.get("/google/connect", connectGoogleCalendar);
router.delete("/google/disconnect", disconnectGoogleCalendar);
router.get("/google/callback", handleGoogleCalendarCallback);
router.post("/create", createScheduledMeeting);
router.get("/synced-meetings", getSyncedMeetings);
router.get("/my-meetings", getMyScheduledMeetings);
router.delete("/delete/:id", deleteScheduledMeeting);

export default router;
