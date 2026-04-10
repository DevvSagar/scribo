import express from "express";
import rateLimit from "express-rate-limit";
import { sendContactEmail } from "../controllers/contactController.js";

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many contact requests. Please wait a minute and try again.",
  },
});

router.post("/send-email", contactLimiter, sendContactEmail);

export default router;
