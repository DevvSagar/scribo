import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import { createHttpError } from "../utils/httpErrors.js";
import {
  AUTH_COOKIE_NAME,
  BCRYPT_SALT_ROUNDS,
  getClearCookieOptions,
  getCookieOptions,
  isValidEmail,
  isValidPassword,
  JWT_EXPIRES_IN,
  normalizeEmail,
} from "../utils/security.js";
import logger from "../utils/logger.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";
const AUTH_INPUT_MAX_LENGTH = 320;

const buildToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions(isProduction));
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions(isProduction));
};

const parseAuthInput = (body = {}) => {
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    throw createHttpError(400, "Email and password are required.");
  }

  if (email.length > AUTH_INPUT_MAX_LENGTH) {
    throw createHttpError(400, "Email is too long.");
  }

  if (password.length > 1024) {
    throw createHttpError(400, "Password is too long.");
  }

  if (!isValidEmail(email)) {
    throw createHttpError(400, "Please enter a valid email address.");
  }

  if (!isValidPassword(password)) {
    throw createHttpError(400, "Password must be at least 6 characters long.");
  }

  return { email, password };
};

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = parseAuthInput(req.body);

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = buildToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "Signup successful.",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      logger.error("Signup failed.", { message: error.message });
    }
    res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.publicMessage : "Could not create user.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = parseAuthInput(req.body);

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = buildToken(user._id);
    setAuthCookie(res, token);

    res.json({
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      logger.error("Login failed.", { message: error.message });
    }
    res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.publicMessage : "Could not log in.",
    });
  }
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully." });
});

router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
    },
  });
});

export default router;
