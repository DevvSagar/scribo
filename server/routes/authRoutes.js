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

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";

const buildToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const setAuthCookie = (res, token) => {
  // Store the JWT in an httpOnly cookie so frontend JavaScript cannot read it.
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions(isProduction));
  console.log(`[auth] set cookie "${AUTH_COOKIE_NAME}" with 7 day session`);
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions(isProduction));
  console.log(`[auth] cleared cookie "${AUTH_COOKIE_NAME}"`);
};

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!isValidEmail(email)) {
      throw createHttpError(400, "Please enter a valid email address.");
    }

    if (!isValidPassword(password)) {
      throw createHttpError(400, "Password must be at least 6 characters long.");
    }

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
    res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.publicMessage : "Could not create user.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!isValidEmail(email)) {
      throw createHttpError(400, "Please enter a valid email address.");
    }

    if (!isValidPassword(password)) {
      throw createHttpError(400, "Password must be at least 6 characters long.");
    }

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
