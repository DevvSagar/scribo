import mongoose from "mongoose";

const googleCalendarTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    encryptedAccessToken: {
      type: String,
      required: true,
    },
    encryptedRefreshToken: {
      type: String,
      default: "",
    },
    scope: {
      type: String,
      default: "",
      trim: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const GoogleCalendarToken =
  mongoose.models.GoogleCalendarToken ||
  mongoose.model("GoogleCalendarToken", googleCalendarTokenSchema);

export default GoogleCalendarToken;
