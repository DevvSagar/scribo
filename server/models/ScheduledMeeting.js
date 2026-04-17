import mongoose from "mongoose";

const scheduledMeetingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    source: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
      required: true,
    },
    meetingType: {
      type: String,
      enum: ["manager", "employee", "ceo", "personal"],
      default: "personal",
      required: true,
    },
    platform: {
      type: String,
      enum: ["gmeet", "zoom", "teams"],
      default: "gmeet",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    attendees: {
      type: [String],
      default: [],
    },
    meetingLink: {
      type: String,
      default: "",
      trim: true,
    },
    calendarEventId: {
      type: String,
      default: "",
      trim: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
      index: true,
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

scheduledMeetingSchema.index({ userId: 1, startTime: 1 });
scheduledMeetingSchema.index({ reminderSent: 1, startTime: 1, source: 1 });

const ScheduledMeeting =
  mongoose.models.ScheduledMeeting ||
  mongoose.model("ScheduledMeeting", scheduledMeetingSchema);

export default ScheduledMeeting;
